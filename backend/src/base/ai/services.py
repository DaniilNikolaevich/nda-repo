import json
import logging

from openai import OpenAI, DefaultHttpxClient

from base.ai.exceptions import OpenAIWrapperError
from base.ai.prompts import RETRIEVE_CV_INFORMATION_SYSTEM_PROMPT, RETRIEVE_CV_INFORMATION_USER_PROMPT, \
    FIND_SUITABLE_USERS_SYSTEM_PROMPT, FIND_SUITABLE_USERS_USER_PROMPT, FIND_SUITABLE_VACANCIES_SYSTEM_PROMPT, \
    FIND_SUITABLE_VACANCIES_USER_PROMPT, FIND_SIMILAR_VACANCIES_SYSTEM_PROMPT, FIND_SIMILAR_VACANCIES_USER_PROMPT
from settings.settings import OPENAI_ORGANIZATION_ID, OPENAI_PROJECT_ID, OPENAI_SERVICE_ACCOUNT_SECRET_KEY, \
    OPENAI_PROXY_URL

logger = logging.getLogger(__name__)


class OpenAIWrapper:
    client = None

    def __init__(
            self,
            organization=OPENAI_ORGANIZATION_ID,
            project=OPENAI_PROJECT_ID,
            api_key=OPENAI_SERVICE_ACCOUNT_SECRET_KEY,
            proxy=OPENAI_PROXY_URL
    ):
        try:
            self.client = OpenAI(
                organization=organization,
                project=project,
                api_key=api_key,
                http_client=DefaultHttpxClient(proxies={"http://": proxy, "https://": proxy})
            )
        except Exception as error:
            logger.error(f"Failed to initialize OpenAI client. Error: {error}")
            raise OpenAIWrapperError("Failed to initialize OpenAI client")

    def process_cv(self, cv_content):
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-2024-05-13",
                messages=[
                    {"role": "system", "content": RETRIEVE_CV_INFORMATION_SYSTEM_PROMPT},
                    {"role": "user", "content": RETRIEVE_CV_INFORMATION_USER_PROMPT.format(cv_content=cv_content)},
                ],
                temperature=0,
            )
            logger.info(print(response))
            response_content = response.choices[0].message.content
            cleaned_response_content = response_content.strip().replace('json', '').replace('```', '').strip()
            if cleaned_response_content == "NULL":
                logger.error("Failed to parse CV data from the user's response. OpenAI returned NULL")
                raise OpenAIWrapperError("Failed to parse CV data from the user's response")
            try:
                user_cv_data = json.loads(cleaned_response_content)
            except Exception as error:
                logger.error(f"Failed to parse CV data from the user's response. Error: {error}")
                raise OpenAIWrapperError("Failed to transform CV data to python dict from the user's response")
            return user_cv_data
        except Exception as error:
            logger.error(f"Failed to parse CV data from the user's response. Error: {error}")
            raise OpenAIWrapperError("Failed to parse CV data from the user's response")

    def find_suitable_candidates_for_vacancy(self, vacancy_info, users_info):
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-2024-05-13",
                messages=[
                    {"role": "system", "content": FIND_SUITABLE_USERS_SYSTEM_PROMPT},
                    {"role": "user", "content": FIND_SUITABLE_USERS_USER_PROMPT.format(
                        vacancy_info=vacancy_info, users_info=users_info)},
                ],
                temperature=0,
            )
            logger.info(print(response))
            response_content = response.choices[0].message.content
            cleaned_response_content = response_content.strip().replace('json', '').replace('```', '').strip()
            if cleaned_response_content == "NULL":
                logger.error("Failed to parse suitable candidates from the user's response. OpenAI returned NULL")
                raise OpenAIWrapperError("Failed to parse suitable candidates from the user's response")
            try:
                suitable_candidates = json.loads(cleaned_response_content)
                suitable_candidates = suitable_candidates.get("candidates", [])
            except Exception as error:
                logger.error(f"Failed to parse suitable candidates from the user's response. Error: {error}")
                raise OpenAIWrapperError(
                    "Failed to transform suitable candidates to python dict from the user's response")
            return suitable_candidates
        except Exception as error:
            logger.error(f"Failed to parse suitable candidates from the user's response. Error: {error}")
            raise OpenAIWrapperError(f"Failed to parse suitable candidates from the user's response. General error: {error}")

    def find_suitable_vacancies_for_candidate(self, user_info, vacancies_info):
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-2024-05-13",
                messages=[
                    {"role": "system", "content": FIND_SUITABLE_VACANCIES_SYSTEM_PROMPT},
                    {"role": "user", "content": FIND_SUITABLE_VACANCIES_USER_PROMPT.format(
                        user_info=user_info, vacancies_info=vacancies_info)},
                ],
                temperature=0,
            )
            logger.info(print(response))
            response_content = response.choices[0].message.content
            cleaned_response_content = response_content.strip().replace('json', '').replace('```', '').strip()
            if cleaned_response_content == "NULL":
                logger.error("Failed to parse suitable vacancies from the user's response. OpenAI returned NULL")
                raise OpenAIWrapperError("Failed to parse suitable vacancies from the user's response")
            try:
                suitable_vacancies = json.loads(cleaned_response_content)
                suitable_vacancies = suitable_vacancies.get("vacancies", [])
            except Exception as error:
                logger.error(f"Failed to parse suitable vacancies from the user's response. Error: {error}")
                raise OpenAIWrapperError(
                    "Failed to transform suitable vacancies to python dict from the user's response")
            return suitable_vacancies
        except Exception as error:
            logger.error(f"Failed to parse suitable vacancies from the user's response. Error: {error}")
            raise OpenAIWrapperError("Failed to parse suitable vacancies from the user's response")

    def find_similar_vacancies(self, current_vacancy, vacancies_info):
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-2024-05-13",
                messages=[
                    {"role": "system", "content": FIND_SIMILAR_VACANCIES_SYSTEM_PROMPT},
                    {"role": "user", "content": FIND_SIMILAR_VACANCIES_USER_PROMPT.format(
                        current_vacancy=current_vacancy, vacancies_info=vacancies_info)},
                ],
                temperature=0,
            )
            logger.info(print(response))
            response_content = response.choices[0].message.content
            cleaned_response_content = response_content.strip().replace('json', '').replace('```', '').strip()
            if cleaned_response_content == "NULL":
                logger.error("Failed to parse similar vacancies from the user's response. OpenAI returned NULL")
                raise OpenAIWrapperError("Failed to parse similar vacancies from the user's response")
            try:
                similar_vacancies = json.loads(cleaned_response_content)
                similar_vacancies = similar_vacancies.get("vacancies", [])
            except Exception as error:
                logger.error(f"Failed to parse similar vacancies from the user's response. Error: {error}")
                raise OpenAIWrapperError(
                    "Failed to transform similar vacancies to python dict from the user's response")
            return similar_vacancies
        except Exception as error:
            logger.error(f"Failed to parse similar vacancies from the user's response. Error: {error}")
            raise OpenAIWrapperError("Failed to parse similar vacancies from the user's response")

    def health_check(self):
        response = self.client.chat.completions.create(
            model="gpt-4o-2024-05-13",
            messages=[
                {"role": "user", "content": "Сколько будет 150+150? В ответе должно быть число."},
            ],
            temperature=0,
        )
        return response.choices[0].message.content
