# The Pay Packet

An interactive explainer of Singapore ministerial salary frameworks. Choose a
ministerial reference role or enter a monthly salary to compare annual pay,
bonus assumptions, cash, chicken-rice and household-income scales.

## Licence and attribution

This repository is licensed under **Creative Commons Attribution-NonCommercial
4.0 International (CC BY-NC 4.0)**. It is not available for commercial use.
See [LICENSE](LICENSE) and the [full legal code](https://creativecommons.org/licenses/by-nc/4.0/legalcode).

You may share and adapt the repository for non-commercial purposes when you:

- credit **Caleb Chong** and link to this repository;
- state that the work is licensed under CC BY-NC 4.0 and link to the licence;
- identify any changes you made; and
- do not use it for commercial advantage or monetary compensation.

Suggested attribution: “The Pay Packet by Caleb Chong, adapted from
https://github.com/calebchongc/singapore-ministerial-pay, licensed under CC
BY-NC 4.0.”

Commercial use requires prior written permission from the copyright holder.

The licence applies only to original material in this repository. Linked
government publications and other third-party source material remain subject
to their own terms.

## Run locally

```bash
npm install
npm run dev
```

## Verify

```bash
node node_modules/typescript/bin/tsc --noEmit
node --experimental-strip-types --test lib/salary.test.ts
```

## Sources

The calculator links to the underlying PSD, PMO and SingStat publications in
the site’s “Sources & how this works” section. It is an independent explainer,
not an official government service or personal salary disclosure.
