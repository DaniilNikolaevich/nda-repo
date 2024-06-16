import logging
import uuid

from django.db import models

logger = logging.getLogger(__name__)


class BaseModel(models.Model):
    objects = models.Manager()

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        verbose_name="ID"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Создано"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Обновлено"
    )

    class Meta:
        abstract = True


class WorkSchedule(models.IntegerChoices):
    FULL_TIME = 0, "Полный день"
    SHIFT = 1, "Сменный график"
    FLEXIBLE = 2, "Гибкий график"
    REMOTE = 3, "Удаленная работа"
    HYBRID = 4, "Гибридная работа"
    PART_TIME = 5, "Неполный рабочий день"


class EmploymentType(models.IntegerChoices):
    FULL_TIME = 0, "Полная занятость"
    PART_TIME = 1, "Частичная занятость"
    SIDE_JOB = 2, "Подработка"
    PROJECT = 3, "Проектная работа"
    INTERNSHIP = 4, "Стажировка"
    TEMPORARY = 5, "Временная работа"


class Verification(models.Model):
    is_verified = models.BooleanField(default=False, verbose_name="Подтверждено")

    class Meta:
        abstract = True


class Country(BaseModel, Verification):
    name = models.CharField(max_length=255, verbose_name="Название")

    class Meta:
        verbose_name = "Страна"
        verbose_name_plural = "Страны"
        ordering = ['name']

    def __str__(self):
        return self.name


class City(BaseModel, Verification):
    name = models.CharField(max_length=255, verbose_name="Название")

    class Meta:
        verbose_name = "Город"
        verbose_name_plural = "Города"
        ordering = ['name']

    def __str__(self):
        return self.name


class Skill(BaseModel, Verification):
    name = models.CharField(
        max_length=255,
        verbose_name="Название",
        unique=True
    )

    class Meta:
        verbose_name = "Навык"
        verbose_name_plural = "Навыки"
        ordering = ['name']

    def __str__(self):
        return self.name


class SpecializationGroup(BaseModel):
    name = models.CharField(
        max_length=255,
        verbose_name="Название",
        unique=True
    )

    class Meta:
        verbose_name = "Группа специализаций"
        verbose_name_plural = "Группы специализаций"
        ordering = ['name']

    def __str__(self):
        return self.name


class Specialization(BaseModel):
    name = models.CharField(
        max_length=255,
        verbose_name="Название"
    )
    group = models.ForeignKey(
        SpecializationGroup,
        on_delete=models.CASCADE,
        verbose_name="Группа",
        related_name="specializations"
    )

    class Meta:
        verbose_name = "Специализация"
        verbose_name_plural = "Специализации"
        ordering = ['name']

    def __str__(self):
        return self.name


class Position(BaseModel, Verification):
    name = models.CharField(
        max_length=255,
        verbose_name="Название",
        unique=True
    )

    class Meta:
        verbose_name = "Должность"
        verbose_name_plural = "Должности"
        ordering = ['name']

    def __str__(self):
        return self.name


class Institution(BaseModel, Verification):
    name = models.CharField(
        max_length=255,
        verbose_name="Название",
        unique=True
    )

    class Meta:
        verbose_name = "Учебное заведение"
        verbose_name_plural = "Учебные заведения"
        ordering = ['name']

    def __str__(self):
        return self.name


class EmployeeCompany(BaseModel, Verification):
    name = models.CharField(
        max_length=500,
        verbose_name="Название",
    )

    class Meta:
        verbose_name = "Компания"
        verbose_name_plural = "Компании"
        ordering = ['name']

    def __str__(self):
        return self.name


class Department(BaseModel):
    name = models.CharField(
        max_length=255,
        verbose_name="Название",
        unique=True
    )

    class Meta:
        verbose_name = "Отдел"
        verbose_name_plural = "Отделы"
        ordering = ['name']

    def __str__(self):
        return self.name
