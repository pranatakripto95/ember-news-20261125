# Ember News 25 November

[![make.fun](https://make.fun/badge/news-image-20261125.svg)](https://make.fun/c/news-image-20261125)
[![rank](https://make.fun/badge/news-image-20261125/pranatakripto95/ember-news-20261125/rank.svg)](https://make.fun/c/news-image-20261125)
[![reward](https://make.fun/badge/news-image-20261125/pranatakripto95/ember-news-20261125/reward.svg)](https://make.fun/c/news-image-20261125)

A one-page front page summing up Wednesday 25 November 2026 world news,
drawn entirely in code for the make.fun
[news-image-20261125](https://make.fun/c/news-image-20261125) bounty.

![Ember News 25 November](entry.png)

## The day in the image

- **Lead — CIA system breached in a cyberattack:** an unclassified CIA
  system was breached, an AP source says; other US intelligence systems
  were also hit, reports say. (AP / CNN, 25 Nov 2026)
- **Trade — US ready to raise tariffs on China, the EU and 14 others:**
  the Trump administration prepares new duties after a probe into
  subsidised production, AP sources say. (AP, 25 Nov 2026)
- **Space — Shenzhou-24 lifts off to Tiangong:** Tang Hongbo, Wu Yi and
  Pakistan's Muhammad Zeeshan Ali, 40, fly to the station. Ali is the
  first Pakistani in orbit and the first foreign visitor to Tiangong.
  (Reuters / Xinhua, 25 Nov 2026)
- **Pacific — Australia is the Solomons' top partner:** Albanese and Wale
  sign a treaty in Canberra; Honiara says no foreign military base on its
  soil. (AP / Reuters, 25 Nov 2026)
- **Colombia — 30 held in a Cartagena supermarket siege:** masked gunmen
  seize an Exito store after a failed armoured-van robbery; 10 freed,
  about 20 still held. (Reuters / Sky News, 25 Nov 2026)
- **Markets — Asian shares slide as the Nvidia rally fades:** tech falls
  in Asia after a Wall Street retreat; Nvidia slid 6% on Tuesday after
  Monday's surge. (AP / Reuters, 25 Nov 2026)

## How it is made

`main.ts` (Node 22, standard library only) plots every pixel itself into a
1024x1024 PNG: a hand-built 5x7 bitmap font, small vector-style icons for
each story (shield, bars, rocket, island, shop, chart), and a deterministic
PNG encoder on top of Node's zlib. No network, no external images. Run it
with:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

It writes `out/entry.png` (1024x1024, ~17 KB), byte-identical on every run.

## License

MIT — see [LICENSE](LICENSE).
