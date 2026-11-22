'use client';

import { useEffect, useRef } from 'react';
import { translateSiteText } from '../utils/site-translations';

const translatedAttributes = ['placeholder', 'aria-label', 'title', 'alt'];
const ignoredTextParents = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA']);

export default function LanguageTranslator({ language }) {
  const originalText = useRef(new WeakMap()).current;
  const displayedText = useRef(new WeakMap()).current;
  const originalAttributes = useRef(new WeakMap()).current;
  const displayedAttributes = useRef(new WeakMap()).current;

  useEffect(() => {
    const translateTextNode = (node) => {
      if (!node.parentElement || ignoredTextParents.has(node.parentElement.tagName)) return;

      const current = node.nodeValue;
      const previousDisplay = displayedText.get(node);
      const source = originalText.has(node) && current === previousDisplay
        ? originalText.get(node)
        : current;
      originalText.set(node, source);

      const leading = source.match(/^\s*/)?.[0] || '';
      const trailing = source.match(/\s*$/)?.[0] || '';
      const phrase = source.slice(leading.length, source.length - trailing.length || undefined);
      const translated = `${leading}${translateSiteText(phrase, language)}${trailing}`;

      displayedText.set(node, translated);
      if (current !== translated) node.nodeValue = translated;
    };

    const translateElementAttributes = (element) => {
      let originals = originalAttributes.get(element);
      let displayed = displayedAttributes.get(element);
      if (!originals) {
        originals = new Map();
        displayed = new Map();
        originalAttributes.set(element, originals);
        displayedAttributes.set(element, displayed);
      }

      translatedAttributes.forEach((attribute) => {
        if (!element.hasAttribute(attribute)) return;
        const current = element.getAttribute(attribute);
        const source = originals.has(attribute) && current === displayed.get(attribute)
          ? originals.get(attribute)
          : current;
        originals.set(attribute, source);
        const translated = translateSiteText(source, language);
        displayed.set(attribute, translated);
        if (current !== translated) element.setAttribute(attribute, translated);
      });
    };

    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        translateTextNode(node);
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE && node !== document.body) return;
      if (node.nodeType === Node.ELEMENT_NODE) translateElementAttributes(node);

      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      let textNode;
      while ((textNode = walker.nextNode())) translateTextNode(textNode);
      if (node.querySelectorAll) node.querySelectorAll('*').forEach(translateElementAttributes);
    };

    processNode(document.body);
    const observer = new MutationObserver((changes) => {
      changes.forEach((change) => {
        if (change.type === 'characterData') translateTextNode(change.target);
        change.addedNodes?.forEach(processNode);
        if (change.type === 'attributes') translateElementAttributes(change.target);
      });
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: translatedAttributes,
    });

    return () => observer.disconnect();
  }, [language]);

  return null;
}
