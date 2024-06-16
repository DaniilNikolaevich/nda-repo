import json

from base.models import *


def insert_cities():
    with open('users/data/cities.json', 'r') as file:
        data = json.load(file)
        for item in data:
            City.objects.get_or_create(name=item['city'], is_verified=True)


def insert_specialization():
    with open('users/data/specializations.json', 'r') as file:
        data = json.load(file)
        for item in data:
            group, _ = SpecializationGroup.objects.get_or_create(name=item['group'])
            Specialization.objects.get_or_create(name=item['specialization'], group=group)


def insert_institutions():
    with open('users/data/universities.json', 'r') as file:
        data = json.load(file)
        for item in data:
            Institution.objects.get_or_create(name=item['Name'], is_verified=True)


def insert_positions():
    with open('users/data/positions.json', 'r') as file:
        data = json.load(file)
        for item in data:
            print(item)
            position, created = Position.objects.get_or_create(name=item['position'], is_verified=True)
            position.is_verified = True
            position.save()
    return True


def insert_skills():
    with open('users/data/skills.json', 'r') as file:
        data = json.load(file)
        for item in data:
            print(item)
            skill, created = Skill.objects.get_or_create(name=item['skill'], defaults={"is_verified": True})
            skill.is_verified = True
            skill.save()
    return True


def insert_companies():
    with open('users/data/companies.json', 'r') as file:
        data = json.load(file)
        for item in data:
            print(item)
            company, created = EmployeeCompany.objects.get_or_create(name=item['company'], is_verified=True)
            company.is_verified = True
            company.save()
    return True


def insert_countries():
    with open('users/data/countries.json', 'r') as file:
        data = json.load(file)
        for item in data.values():
            print(item)
            country, created = Country.objects.get_or_create(name=item, is_verified=True)
            country.is_verified = True
            country.save()
    return True


if __name__ == 'django.core.management.commands.shell':
    # insert_cities()
    # insert_specialization()
    # insert_institutions()
    insert_positions()
    insert_skills()
    insert_countries()


def delete_duplicates():
    from django.db.models import Count
    from base.models import City
    # First, we find the names that appear more than once
    duplicate_names = (City.objects.values('name')
                       .annotate(name_count=Count('name'))
                       .filter(name_count__gt=1))
    for entry in duplicate_names:
        # For each duplicated name, we find the duplicate records
        duplicate_records = City.objects.filter(name=entry['name'])
        if duplicate_records.exists():
            # If there are duplicates, we order by creation date and keep the most recent one
            duplicate_records = duplicate_records.order_by('-created_at')
            legitimate_record = duplicate_records[0]  # Keep the most recent one
            print(f"Keeping the legitimate record with ID {legitimate_record.id} for the name {entry['name']}")
            # Delete all other duplicates (careful: this is a query that deletes multiple records at once)
            City.objects.filter(name=entry['name']).exclude(id=legitimate_record.id).delete()
