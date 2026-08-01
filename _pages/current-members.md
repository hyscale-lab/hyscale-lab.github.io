---
layout: page
permalink: /people/current-members/
title: Current Members
description: The HyScale Lab principal investigator and current research team.
nav: false
---

{% assign pi = site.data.current_members.principal_investigator %}
{% assign pi_photo = pi.photo | default: '' | strip %}
{% assign pi_url = pi.url | default: '' | strip %}
{% assign pi_role = pi.role | default: '' | strip %}
{% assign pi_affiliation = pi.affiliation | default: '' | strip %}
{% assign pi_period = pi.period | default: '' | strip %}
{% assign pi_notes = pi.notes | default: '' | strip %}

## Principal investigator

<div class="row row-cols-1 row-cols-md-2">
  <div class="col mb-4">
    <article class="card">
      <div class="row g-0 align-items-center">
        {% if pi_photo != empty %}
          <div class="col-md-4">
            <img
              class="img-fluid card-img"
              src="{{ pi_photo | prepend: '/assets/img/' | relative_url | escape }}"
              alt="Portrait of {{ pi.name | escape }}"
            >
          </div>
        {% endif %}
        <div class="{% if pi_photo != empty %}col-md-8{% else %}col-12{% endif %}">
          <div class="card-body">
            <h4>
              {% if pi_url != empty %}<a href="{{ pi_url | escape }}">{{ pi.name | escape }}</a>{% else %}{{ pi.name | escape }}{% endif %}
            </h4>
            {% if pi_affiliation != empty %}<p class="card-text">{{ pi_affiliation | escape }}</p>{% endif %}
            {% if pi_period != empty or pi_role != empty %}
              <p class="card-text">
                {% if pi_period != empty %}{{ pi_period | escape }}{% endif %}{% if pi_period != empty and pi_role != empty %} — {% endif %}{% if pi_role != empty %}{{ pi_role | escape }}{% endif %}
              </p>
            {% endif %}
            {% if pi_notes != empty %}<p class="card-text">{{ pi_notes | escape }}</p>{% endif %}
          </div>
        </div>
      </div>
    </article>
  </div>
</div>

{% for group in site.data.current_members.groups %}
{% if group.members.size > 0 %}

## {{ group.title }}

<div class="row row-cols-1 row-cols-md-2">
    {% for person in group.members %}
      {% assign person_photo = person.photo | default: '' | strip %}
      {% assign person_url = person.url | default: '' | strip %}
      {% assign person_role = person.role | default: '' | strip %}
      {% assign person_affiliation = person.affiliation | default: '' | strip %}
      {% assign person_period = person.period | default: '' | strip %}
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
