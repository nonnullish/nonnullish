---
title: Search
layout: layouts/note
description: Search in site
eleventyExcludeFromCollections: true
---
<style>
  .pagefind-ui__form {
    display: grid;
    grid-template-columns: auto min-content;

    .pagefind-ui__search-input {
      grid-area: 1 / 1 / 2 / 2;
    }

    .pagefind-ui__search-clear {
      grid-area: 1 / 2 / 2 / 3;
    }

    .pagefind-ui__drawer {
      grid-area: 2 / 1 / 3 / 3;
    }

    .pagefind-ui__search-input, .pagefind-ui__search-clear {
      border: none;
      outline: none;
      appearance: none;
      font-size: inherit;
      font-family: inherit;
      background: transparent;
      font-weight: inherit;
      padding: var(--padding);
      border-bottom: 1px solid currentcolor;
      color: currentColor;
      border-radius: 0;
    }

    .pagefind-ui__search-clear {
      cursor: var(--cursor-pointer);
      transition: font-weight 0.2s;

      &:hover {
        font-weight: 700;
        transition: font-weight 0.2s;
      }
    }

    .pagefind-ui__message, .pagefind-ui__result-title {
      font-weight: 700;
    }

    .pagefind-ui__result-title {
      margin: 0;
    }

    .pagefind-ui__result-link {
      text-decoration: none;
    }

    .pagefind-ui__button {
      width: 100%;
      background: transparent;
      border: transparent;
      outline: transparent;
      font-size: inherit;
      font-family: inherit;
      font-weight: inherit;
      padding-top: var(--padding);
      cursor: var(--cursor-pointer);
      transition: font-weight 0.2s;
      color: currentColor;

      &:hover {
        font-weight: 700;
        transition: font-weight 0.2s;
      }
    }
  }
</style>
<div id="search" class="search"></div>
<script src="/pagefind/pagefind-ui.js" onload="new PagefindUI({ element: '#search', showImages: false });"></script>