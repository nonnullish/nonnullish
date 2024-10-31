---
title: Weeknotes
description: Notes from Last Week
layout: layouts/weeknotes.njk
eleventyExcludeFromCollections: true
---
<style>
  .year {
    display: grid;
    gap: 1rem;

    .month {
      display: grid;
      grid-template-columns: repeat(auto-fit, 20%);
      justify-content: right;
      justify-items: center;
      margin: 0;
      padding: 0;

      .week {
        align-items: center;
        border-radius: 100%;
        display: flex;
        justify-content: center;
        width: min-content;

        span {
          color: #dadada;
        }

        a {
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
</style>

[About Weeknotes](/posts/about-weeknotes/)

{%- for year in collections.weeknotes reversed -%}
<p><b>{{ year[0] }}</b></p>
<div class="year">
{%- for month in year[1] reversed -%}
<div class="month">
{% for week in month reversed  %}
<div class="week">
{% if week.post %}<a href="{{ week.post.url }}">{{ week.week }}</a>{% else %}<span>{{ week.week }}</span>{% endif %}
</div>
{% endfor %}
</div>
{%- endfor -%}
</div>
{%- endfor -%}
