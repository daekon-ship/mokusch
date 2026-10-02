# Mókusch — Kávézó & Tortaműhely · Látványterv

Prémium látványterv a **Mókusch** (1012 Budapest, Várfok u. 30.) weboldalához.

> ⚠️ Ez egy **dizájn-koncepció** (látványterv), nem a végleges éles weboldal.
> A képek stock helyettesítők (a kész fotókkal cserélendők), a vélemények
> idézet-placeholderek, a rendelés űrlap demó módban működik.

## Élő megtekintés

**https://daekon-ship.github.io/mokusch/**

## Technikai összefoglaló

- **Stack:** tiszta HTML + CSS + JS — külső függőség, build lépés nélkül
- **Nyelv:** magyar
- **Betűtípusok:** Fraunces (display) + Figtree (szövegtörzs), self-hosted woff2, latin + latin-ext
- **Képek:** lokál tárolt webp (~27 MB), reszponzív srcset-tel
- **Szekciók:** hero, történet, kínálat, torták (masonry), 8 lépéses rendelési wizard, évszakok, galéria + lightbox, vélemények, helyszín (klikk-re mutatott térkép), footer
- **Reszponzív:** mobilra külön art direction (hero crop, sticky CTA), 44px touch targetek

## Helyi futtatás

```bash
python -m http.server 8123
# majd: http://127.0.0.1:8123
```
