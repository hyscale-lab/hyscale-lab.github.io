---
layout: page
permalink: /people/former-members/
title: Former Members
description: Former members of HyScale Lab and their recorded destinations.
nav: false
---

{% for group in site.data.former_members.groups %}
{% if group.members.size > 0 %}

## {{ group.title }}

<div class="row row-cols-1 row-cols-md-2">
    {% for person in group.members %}
      {% assign person_photo = person.photo | default: '' | strip %}
      {% assign person_url = person.url | default: '' | strip %}
      {% assign person_role = person.role | default: '' | strip %}
      {% assign person_affiliation = person.affiliation | default: '' | strip %}
      {% assign person_period = person.period | default: '' | strip %}
      {% assign person_destination = person.destination | default: '' | strip %}
      {% assign person_notes = person.notes | default: '' | strip %}

      <div class="col mb-4">
        <article class="card">
          <div class="row g-0 align-items-center">
            {% if person_photo != empty %}
              <div class="col-md-4">
                <img
                  class="img-fluid card-img"
                  src="{{ person_photo | prepend: '/assets/img/' | relative_url | escape }}"
                  alt="Portrait of {{ person.name | escape }}"
                >
              </div>
            {% endif %}
            <div class="{% if person_photo != empty %}col-md-8{% else %}col-12{% endif %}">
              <div class="card-body">
                <h4>
                  {% if person_url != empty %}<a href="{{ person_url | escape }}">{{ person.name | escape }}</a>{% else %}{{ person.name | escape }}{% endif %}
                </h4>
                {% if person_affiliation != empty %}<p class="card-text">{{ person_affiliation | escape }}</p>{% endif %}
                {% if person_period != empty %}
                  <p class="card-text">
                    {% if person_period != empty %}{{ person_period | escape }}{% endif %}
                  </p>
                {% endif %}
                {% if person_destination != empty %}<p class="card-text"><strong>Destination:</strong> {{ person_destination | escape }}</p>{% endif %}
                {% if person_notes != empty %}<p class="card-text">{{ person_notes | escape }}</p>{% endif %}
              </div>
            </div>
          </div>
        </article>
      </div>
    {% endfor %}

</div>
  {% endif %}
{% endfor %}
