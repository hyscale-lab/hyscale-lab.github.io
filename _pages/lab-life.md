---
layout: page
title: Lab Life
permalink: /lab-life/
description: Photos from HyScale Lab events and team-building activities.
nav: true
nav_order: 4
images:
  lightbox2: true
---

{% assign gallery = site.data.lab_life_gallery %}
{% if gallery and gallery != empty %}

  <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
    {% for item in gallery %}
      {% assign item_image = item.image | default: '' | strip %}
      {% assign item_alt = item.alt | default: '' | strip %}
      {% assign item_caption = item.caption | default: '' | strip %}
      {% assign item_event = item.event | default: '' | strip %}
      {% assign item_date = item.date | default: '' | strip %}
      {% if item_image != empty and item_alt != empty %}
        <div class="col">
          {% assign item_alt_escaped = item_alt | escape %}
          {% assign item_caption_escaped = item_caption | escape %}
          <a
            href="{{ item_image | relative_url | escape }}"
            data-lightbox="lab-life"
            {% if item_caption != empty %}
              data-title="{{ item_caption_escaped }}"
            {% endif %}
          >
            {% include figure.liquid
              path=item_image
              class="img-fluid"
              alt=item_alt_escaped
              caption=item_caption_escaped
              sizes="(min-width: 768px) 45vw, 95vw"
              loading="lazy"
            %}
          </a>
          {% if item_event != empty %}
            <p>{{ item_event | escape }}</p>
          {% endif %}
          {% if item_date != empty %}
            <p>{{ item_date | escape }}</p>
          {% endif %}
        </div>
      {% endif %}
    {% endfor %}
  </div>
{% else %}
  <p>Lab Life photos will be added as the group shares approved event and team-building images.</p>
{% endif %}
