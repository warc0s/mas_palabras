import io
import json
import os
import shutil
import tempfile
import unittest
import uuid
from datetime import datetime

from sqlalchemy import case, desc

from app import create_app
from utils.database import db
from utils.models import Feature, Language, Word, QuizSession
from blueprints.words import process_import


class MasPalabrasTestCase(unittest.TestCase):
    def setUp(self):
        self.db_fd, self.db_path = tempfile.mkstemp(prefix="mp_test_db_", suffix=".sqlite")
        os.close(self.db_fd)
        os.environ["SECRET_KEY"] = "test-secret-key"
        os.environ["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{self.db_path}"
        os.environ["FLASK_CONFIG"] = "testing"
        os.environ["SESSION_COOKIE_SECURE"] = "0"
        os.environ["SESSION_COOKIE_SAMESITE"] = "Lax"
        os.environ["SESSION_LIFETIME_SECONDS"] = "3600"

        self.app = create_app("testing")
        self.app.config["PROPAGATE_EXCEPTIONS"] = False
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
        self.client = self.app.test_client()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

        try:
            os.remove(self.db_path)
        except FileNotFoundError:
            pass

    def _create_language(self, name=None, active=True):
        language = Language(language=name or f"Idioma-{uuid.uuid4().hex[:8]}", active=active)
        db.session.add(language)
        db.session.commit()
        return language

    def _create_feature(self, name=None, active=True):
        feature = Feature(feature=name or f"Nivel-{uuid.uuid4().hex[:8]}", active=active)
        db.session.add(feature)
        db.session.commit()
        return feature

    def _create_word(self, language=None, feature=None, **kwargs):
        language = language or self._create_language()
        feature = feature or self._create_feature()
        word = Word(
            english_word=kwargs.get("english_word", f"word-{uuid.uuid4().hex[:6]}"),
            translation=kwargs.get("translation", "traducción"),
            explanation=kwargs.get("explanation", ""),
            language_id=language.id,
            feature_id=feature.id,
        )
        if "times_practiced" in kwargs:
            word.times_practiced = kwargs["times_practiced"]
        if "times_correct" in kwargs:
            word.times_correct = kwargs["times_correct"]
        if "last_practiced" in kwargs:
            word.last_practiced = kwargs["last_practiced"]
        db.session.add(word)
        db.session.commit()
        return word

    def test_config_values_loaded_from_environment(self):
        self.assertEqual(self.app.config["SECRET_KEY"], "test-secret-key")
        self.assertEqual(self.app.config["SQLALCHEMY_DATABASE_URI"], f"sqlite:///{self.db_path}")
        self.assertIsNone(self.app.config.get("UPLOAD_FOLDER"))
        self.assertFalse(self.app.config["SESSION_COOKIE_SECURE"])
        self.assertEqual(self.app.config["SESSION_COOKIE_SAMESITE"], "Lax")
        self.assertEqual(int(self.app.config["PERMANENT_SESSION_LIFETIME"].total_seconds()), 3600)

    def test_404_handler_renders_custom_template(self):
        response = self.client.get("/ruta-que-no-existe")
        self.assertEqual(response.status_code, 404)
        self.assertIn("Página no encontrada", response.get_data(as_text=True))

    def test_internal_error_handler_returns_500(self):
        @self.app.route("/cause-error")
        def cause_error():
            raise RuntimeError("boom")

        response = self.client.get("/cause-error")
        self.assertEqual(response.status_code, 500)
        self.assertIn("Error interno del servidor", response.get_data(as_text=True))

    def test_delete_language_requires_post(self):
        language = self._create_language(name="Aleman")
        response = self.client.get(f"/delete_language/{language.id}")
        self.assertEqual(response.status_code, 405)

    def test_delete_language_without_words_removes_language(self):
        language = self._create_language(name="Italiano")
        response = self.client.post(f"/delete_language/{language.id}")
        self.assertEqual(response.status_code, 302)
        self.assertIsNone(db.session.get(Language, language.id))

    def test_delete_language_with_words_marks_inactive(self):
        language = self._create_language(name="Francés")
        feature = self._create_feature(name="A1")
        self._create_word(language=language, feature=feature)

        response = self.client.post(f"/delete_language/{language.id}")
        self.assertEqual(response.status_code, 302)
        updated_language = db.session.get(Language, language.id)
        self.assertIsNotNone(updated_language)
        self.assertFalse(updated_language.active)

    def test_delete_word_requires_post(self):
        word = self._create_word()
        response = self.client.get(f"/delete/{word.id}")
        self.assertEqual(response.status_code, 405)

    def test_delete_word_via_post_removes_record(self):
        word = self._create_word()
        response = self.client.post(f"/delete/{word.id}")
        self.assertEqual(response.status_code, 302)
        self.assertIsNone(db.session.get(Word, word.id))

    def test_bulk_delete_requires_json_payload(self):
        response = self.client.post("/bulk_delete", data={"word_ids": [1, 2]})
        self.assertEqual(response.status_code, 400)
        payload = response.get_json()
        self.assertIsNotNone(payload)
        self.assertEqual(payload.get("error"), "Solicitud inválida")

    def test_bulk_delete_removes_multiple_words(self):
        words = [self._create_word() for _ in range(3)]
        word_ids = [w.id for w in words]

        response = self.client.post("/bulk_delete", json={"word_ids": word_ids})
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload.get("deleted"), 3)
        self.assertEqual(payload.get("message"), "3 palabras eliminadas")
        self.assertEqual(Word.query.count(), 0)

    def test_bulk_delete_rejects_invalid_ids(self):
        response = self.client.post("/bulk_delete", json={"word_ids": ["abc", 2]})
        self.assertEqual(response.status_code, 400)
        payload = response.get_json()
        self.assertEqual(payload.get("error"), "IDs inválidos proporcionados")

    def test_word_form_blocks_normalized_duplicate(self):
        language = self._create_language(name="Español")
        feature = self._create_feature(name="A2")

        response = self.client.post(
            "/maspalabras",
            data={
                "english_word": "Café",
                "translation": "Coffee",
                "explanation": "Bebida",
                "language": language.id,
                "feature": feature.id,
            },
            follow_redirects=True,
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Word.query.count(), 1)

        duplicate = self.client.post(
            "/maspalabras",
            data={
                "english_word": "Cafe",
                "translation": "Coffee",
                "explanation": "Duplicado",
                "language": language.id,
                "feature": feature.id,
            },
            follow_redirects=True,
        )
        self.assertEqual(duplicate.status_code, 200)
        self.assertIn("ya existe en este idioma", duplicate.get_data(as_text=True))
        self.assertEqual(Word.query.count(), 1)

    def test_verpalabras_pagination_controls(self):
        language = self._create_language(name="Inglés")
        feature = self._create_feature(name="General")
        for index in range(12):
            self._create_word(
                language=language,
                feature=feature,
                english_word=f"Term-{index:02d}",
                translation=f"Tr-{index:02d}",
            )

        response = self.client.get("/verpalabras?per_page=5&page=2")
        self.assertEqual(response.status_code, 200)
        html = response.get_data(as_text=True)
        self.assertIn("Mostrando 6 - 10 de 12", html)
        self.assertIn("Página 2 de 3", html)
        self.assertEqual(html.count("data-word-id="), 5)

    def test_word_to_dict_includes_iso_dates(self):
        language = self._create_language(name="TestLang")
        feature = self._create_feature(name="TestFeature")
        last_practiced = datetime(2024, 3, 14, 9, 30)
        word = Word(
            english_word="Focus",
            translation="Enfoque",
            explanation="",
            language_id=language.id,
            feature_id=feature.id,
            times_practiced=4,
            times_correct=3,
            last_practiced=last_practiced,
        )
        db.session.add(word)
        db.session.commit()

        fixed_created = datetime(2023, 12, 31, 8, 15)
        word.created_at = fixed_created
        db.session.commit()

        payload = word.to_dict()
        self.assertEqual(payload["last_practiced"], last_practiced.isoformat())
        self.assertEqual(payload["created_at"], fixed_created.isoformat())
        self.assertEqual(payload["accuracy"], 75.0)

    def test_accuracy_sort_places_unpracticed_last(self):
        language = self._create_language(name="AccuracyLang")
        feature = self._create_feature(name="AccuracyFeat")
        high = self._create_word(
            language=language,
            feature=feature,
            english_word="High",
            times_practiced=10,
            times_correct=9,
        )
        zero_accuracy = self._create_word(
            language=language,
            feature=feature,
            english_word="Zero",
            times_practiced=4,
            times_correct=0,
        )
        unpracticed = self._create_word(
            language=language,
            feature=feature,
            english_word="Never",
            times_practiced=0,
            times_correct=0,
        )

        accuracy_expr = case(
            (Word.times_practiced > 0, Word.times_correct * 100.0 / Word.times_practiced),
            else_=0.0,
        )
        unpracticed_rank = case((Word.times_practiced == 0, 1), else_=0)

        desc_order = (
            Word.query.filter(Word.language_id == language.id)
            .order_by(unpracticed_rank, desc(accuracy_expr), Word.english_word)
            .all()
        )
        self.assertEqual([w.id for w in desc_order], [high.id, zero_accuracy.id, unpracticed.id])

        asc_order = (
            Word.query.filter(Word.language_id == language.id)
            .order_by(unpracticed_rank, accuracy_expr, Word.english_word)
            .all()
        )
        self.assertEqual([w.id for w in asc_order], [zero_accuracy.id, high.id, unpracticed.id])

    def test_process_import_reports_per_line_and_persists(self):
        language = self._create_language(name="English")
        feature = self._create_feature(name="Basic")

        data = [
            {
                "english_word": "Alpha",
                "translation": "Alfa",
                "language": language.language,
                "feature": feature.feature,
                "times_practiced": 2,
                "times_correct": 1,
                "last_practiced": "2024-07-10T12:00:00Z",
            },
            {
                "english_word": "Incomplete",
            },
            {
                "english_word": "Alpha",
                "translation": "Alfa actualizada",
                "language": language.language,
                "feature": feature.feature,
            },
            {
                "english_word": "Gamma",
                "translation": "Gama",
                "language": language.language,
                "feature": "Advanced",
            },
        ]

        result = process_import(data, overwrite_mode="skip", create_missing_mode="create")

        self.assertEqual(result["success"], 2)
        self.assertEqual(result["errors"], 1)
        self.assertEqual(result["skipped"], 1)
        self.assertEqual(len(result["issues"]), 2)

        first_issue = result["issues"][0]
        second_issue = result["issues"][1]
        self.assertEqual(first_issue["line"], 2)
        self.assertEqual(first_issue["code"], "missing_fields")
        self.assertEqual(first_issue["action"], "error")
        self.assertEqual(second_issue["line"], 3)
        self.assertEqual(second_issue["code"], "duplicate")
        self.assertEqual(second_issue["action"], "skipped")

        words = Word.query.order_by(Word.english_word).all()
        self.assertEqual(len(words), 2)
        alpha = next(word for word in words if word.english_word == "Alpha")
        self.assertEqual(alpha.times_practiced, 2)
        self.assertEqual(alpha.times_correct, 1)
        self.assertEqual(alpha.last_practiced, datetime(2024, 7, 10, 12, 0))
        gamma = next(word for word in words if word.english_word == "Gamma")
        self.assertEqual(gamma.feature.feature, "Advanced")
        self.assertIn("Advanced", result["created_features"])

    def test_needs_practice_sorting_prioritises_new_words(self):
        language = self._create_language(name="Francés")
        feature = self._create_feature(name="B1")
        w_new = self._create_word(language=language, feature=feature, english_word="Alpha", translation="A")
        w_under = self._create_word(
            language=language,
            feature=feature,
            english_word="Beta",
            translation="B",
            times_practiced=2,
            times_correct=1,
        )
        w_low_accuracy = self._create_word(
            language=language,
            feature=feature,
            english_word="Gamma",
            translation="C",
            times_practiced=5,
            times_correct=2,
        )
        self._create_word(
            language=language,
            feature=feature,
            english_word="Delta",
            translation="D",
            times_practiced=6,
            times_correct=6,
        )

        response = self.client.get("/verpalabras?sort_by=needs_practice&per_page=10")
        html = response.get_data(as_text=True)
        alpha_pos = html.index("Alpha")
        beta_pos = html.index("Beta")
        gamma_pos = html.index("Gamma")
        delta_pos = html.index("Delta")

        self.assertLess(alpha_pos, beta_pos)
        self.assertLess(beta_pos, gamma_pos)
        self.assertLess(gamma_pos, delta_pos)

        # Ensure skipped and answered stats remain unchanged for untouched words
        self.assertEqual(w_new.times_practiced, 0)
        self.assertEqual(w_under.times_practiced, 2)
        self.assertEqual(w_low_accuracy.times_correct, 2)

    def test_quiz_session_persists_progress_and_skip(self):
        language = self._create_language(name="Italiano")
        feature = self._create_feature(name="General")
        first_word = self._create_word(language=language, feature=feature, english_word="House", translation="Casa")
        second_word = self._create_word(language=language, feature=feature, english_word="Car", translation="Auto")

        start_response = self.client.post(
            "/quiz",
            data={
                "language": 0,
                "feature": 0,
                "quiz_type": "to_spanish",
                "only_difficult": "all",
            },
        )
        self.assertEqual(start_response.status_code, 302)
        self.assertEqual(start_response.headers.get("Location"), "/quiz_question")

        quiz_session = QuizSession.query.first()
        self.assertIsNotNone(quiz_session)
        word_pool = json.loads(quiz_session.word_ids)
        self.assertCountEqual(word_pool, [first_word.id, second_word.id])
        self.assertEqual(quiz_session.total_questions, 0)
        self.assertEqual(quiz_session.current_index, 0)

        skip_response = self.client.get("/quiz_question?skip=1")
        self.assertEqual(skip_response.status_code, 200)

        quiz_session = QuizSession.query.first()
        self.assertEqual(quiz_session.total_questions, 1)
        self.assertEqual(quiz_session.correct_answers, 0)
        self.assertEqual(quiz_session.current_index, 1)

        next_word_id = quiz_session.get_word_ids()[quiz_session.current_index]
        next_word = db.session.get(Word, next_word_id)
        answer_response = self.client.post(
            "/quiz_question",
            data={
                "answer": next_word.translation,
                "word_id": str(next_word.id),
                "session_id": quiz_session.session_id,
                "quiz_type": "to_spanish",
            },
        )
        self.assertEqual(answer_response.status_code, 302)
        self.assertEqual(answer_response.headers.get("Location"), "/quiz")

        quiz_session = QuizSession.query.first()
        self.assertEqual(quiz_session.total_questions, 2)
        self.assertEqual(quiz_session.correct_answers, 1)
        self.assertTrue(quiz_session.is_completed)
        self.assertEqual(quiz_session.current_index, 2)

        updated_word = db.session.get(Word, next_word.id)
        self.assertEqual(updated_word.times_practiced, 1)
        self.assertEqual(updated_word.times_correct, 1)

        skipped_word = db.session.get(Word, word_pool[0])
        self.assertEqual(skipped_word.times_practiced, 0)

        with self.client.session_transaction() as flask_session:
            self.assertNotIn("quiz_session_id", flask_session)

    def test_dashboard_accuracy_stats_reflect_practice(self):
        language = self._create_language(name="Estadísticas")
        feature = self._create_feature(name="General")
        self._create_word(
            language=language,
            feature=feature,
            english_word="First",
            translation="Uno",
            times_practiced=5,
            times_correct=3,
        )
        self._create_word(
            language=language,
            feature=feature,
            english_word="Second",
            translation="Dos",
            times_practiced=5,
            times_correct=4,
        )
        self._create_word(
            language=language,
            feature=feature,
            english_word="Third",
            translation="Tres",
            times_practiced=0,
            times_correct=0,
        )

        response = self.client.get("/")
        html = response.get_data(as_text=True)
        self.assertIn("70.0% Precisión", html)
        self.assertIn("A Repasar", html)

    def test_quiz_word_selection_is_unique(self):
        language = self._create_language(name="Portugués")
        feature = self._create_feature(name="Común")
        words = [
            self._create_word(language=language, feature=feature, english_word=f"Term-{idx}", translation=f"T-{idx}")
            for idx in range(5)
        ]

        response = self.client.post(
            "/quiz",
            data={
                "language": 0,
                "feature": 0,
                "quiz_type": "mixed",
                "only_difficult": "all",
            },
        )
        self.assertEqual(response.status_code, 302)
        quiz_session = QuizSession.query.first()
        self.assertIsNotNone(quiz_session)
        pool = quiz_session.get_word_ids()
        self.assertEqual(len(pool), len(words))
        self.assertEqual(len(pool), len(set(pool)))

    def test_import_handles_normalized_duplicates_and_timestamps(self):
        payload = [
            {
                "english_word": "Café",
                "translation": "Coffee",
                "language": "Spanish",
                "feature": "Drinks",
                "times_practiced": 2,
                "times_correct": 1,
                "last_practiced": "2024-07-10T15:00:00+02:00",
            },
            {
                "english_word": "Cafe",
                "translation": "Coffee Shop",
                "language": "Spanish",
                "feature": "Drinks",
            },
            {
                "english_word": "Tea",
                "translation": "Té",
                "language": "Spanish",
                "feature": "Drinks",
                "last_practiced": "Nunca",
            },
        ]

        response = self.client.post(
            "/import_words",
            data={
                "file": (io.BytesIO(json.dumps(payload).encode("utf-8")), "words.json"),
                "overwrite_duplicates": "skip",
                "create_missing": "create",
            },
            content_type="multipart/form-data",
            follow_redirects=True,
        )

        self.assertEqual(response.status_code, 200)
        words = Word.query.order_by(Word.english_word).all()
        self.assertEqual(len(words), 2)
        self.assertEqual(Language.query.filter_by(language="Spanish").count(), 1)
        self.assertEqual(Feature.query.filter_by(feature="Drinks").count(), 1)

        cafe_word = Word.query.filter_by(english_word="Café").first()
        self.assertIsNotNone(cafe_word)
        self.assertEqual(cafe_word.normalized_english_word, "cafe")
        self.assertEqual(cafe_word.times_practiced, 2)
        self.assertEqual(cafe_word.times_correct, 1)
        self.assertEqual(cafe_word.last_practiced, datetime(2024, 7, 10, 13, 0))

        tea_word = Word.query.filter_by(english_word="Tea").first()
        self.assertIsNone(tea_word.last_practiced)

        export_response = self.client.get("/export_words")
        self.assertEqual(export_response.status_code, 200)
        self.assertIn("palabras.json", export_response.headers.get("Content-Disposition", ""))
        exported = export_response.get_json()
        self.assertTrue(all(item.get("language") == "Spanish" for item in exported))
        self.assertTrue(all(item.get("feature") == "Drinks" for item in exported))

    def test_production_session_security_settings(self):
        original_env = {
            key: os.environ.get(key)
            for key in [
                "SECRET_KEY",
                "SQLALCHEMY_DATABASE_URI",
                "SESSION_COOKIE_SECURE",
                "SESSION_COOKIE_SAMESITE",
                "SESSION_LIFETIME_SECONDS",
                "FLASK_DEBUG",
            ]
        }

        prod_fd, prod_db_path = tempfile.mkstemp(prefix="mp_prod_db_", suffix=".sqlite")
        os.close(prod_fd)

        try:
            os.environ["SECRET_KEY"] = "prod-secret"
            os.environ["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{prod_db_path}"
            os.environ.pop("SESSION_COOKIE_SAMESITE", None)
            os.environ["SESSION_COOKIE_SECURE"] = "1"
            os.environ.pop("FLASK_DEBUG", None)
            os.environ.pop("SESSION_LIFETIME_SECONDS", None)

            prod_app = create_app("production")
            self.assertTrue(prod_app.config["SESSION_COOKIE_SECURE"])
            self.assertEqual(prod_app.config["SESSION_COOKIE_SAMESITE"], "Strict")
            self.assertFalse(prod_app.config["DEBUG"])
        finally:
            try:
                os.remove(prod_db_path)
            except FileNotFoundError:
                pass

            for key, value in original_env.items():
                if value is None:
                    os.environ.pop(key, None)
                else:
                    os.environ[key] = value


    def test_api_languages_returns_language_key(self):
        self._create_language(name="Francés")

        response = self.client.get("/api/v1/languages")
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertIn("data", payload)
        self.assertGreaterEqual(payload["meta"]["count"], 1)
        first_language = payload["data"][0]
        self.assertIn("language", first_language)
        self.assertNotIn("name", first_language)

    def test_api_words_crud_flow(self):
        language = self._create_language(name="Inglés")
        feature = self._create_feature(name="General")

        create_response = self.client.post(
            "/api/v1/words",
            json={
                "english_word": "House",
                "translation": "Casa",
                "explanation": "Lugar para vivir",
                "language_id": language.id,
                "feature_id": feature.id,
            },
        )
        self.assertEqual(create_response.status_code, 201)
        created_payload = create_response.get_json()["data"]
        word_id = created_payload["id"]
        self.assertEqual(created_payload["language"], language.language)
        self.assertEqual(created_payload["feature"], feature.feature)

        read_response = self.client.get(f"/api/v1/words/{word_id}")
        self.assertEqual(read_response.status_code, 200)
        self.assertEqual(read_response.get_json()["data"]["english_word"], "House")

        update_response = self.client.put(
            f"/api/v1/words/{word_id}",
            json={
                "english_word": "Home",
                "translation": "Hogar",
                "explanation": "Espacio familiar",
                "language_id": language.id,
                "feature_id": feature.id,
            },
        )
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.get_json()["data"]["english_word"], "Home")

        delete_response = self.client.delete(f"/api/v1/words/{word_id}")
        self.assertEqual(delete_response.status_code, 200)
        self.assertIsNone(db.session.get(Word, word_id))

    def test_api_words_rejects_normalized_duplicates(self):
        language = self._create_language(name="Español")
        feature = self._create_feature(name="A2")
        self._create_word(language=language, feature=feature, english_word="Café", translation="Coffee")

        duplicate_response = self.client.post(
            "/api/v1/words",
            json={
                "english_word": "Cafe",
                "translation": "Coffee",
                "language_id": language.id,
                "feature_id": feature.id,
            },
        )
        self.assertEqual(duplicate_response.status_code, 409)
        payload = duplicate_response.get_json()
        self.assertEqual(payload["error"]["code"], "duplicate_word")

    def test_get_word_returns_json_error_when_missing(self):
        response = self.client.get("/get_word/999999")
        self.assertEqual(response.status_code, 404)
        payload = response.get_json()
        self.assertEqual(payload["error"]["code"], "not_found")
        self.assertIn("Palabra", payload["error"]["message"])



if __name__ == "__main__":
    unittest.main()
