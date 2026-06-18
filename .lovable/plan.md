## Reality check

`coachrony.com` ekta **Vercel-hosted alada site** — ei Lovable project (`coachronyacademy.lovable.app`) er shathe kono code/deploy connection nei. Tomar list er 10 tar moddhe **ekta kajo** ami Lovable theke korte parbona:

- Vercel project access nei → domain reconnect, deployment promote/create, env vars check, DNS verify — kichui Lovable tool diye hobe na
- Code change kore o lab nei — Vercel e push na holey deploy hobe na, ar Lovable project Vercel er shathe linked na

Tai "fix kore dilam" bola dishonest hobe. Eta tomake nijeke korte hobe, ami shudhu **exact steps** dite pari.

---

## Option A: Vercel e nije fix koro (recommended jodi coachrony.com alada app hoy)

**Step 1 — Deployment recover koro**
- vercel.com login → coachrony project open koro
- **Deployments** tab → shobcheye recent "Ready" (green) status er deployment khojo
- Pele: oi deployment er `⋯` menu → **Promote to Production**
- Na pele: GitHub repo te ekta dummy commit push koro (README te space add), auto-deploy trigger hobe. Trigger na hole → Deployments tab → **Redeploy** button

**Step 2 — Domain verify koro**
- Settings → **Domains** → `coachrony.com` ar `www.coachrony.com` dutoi listed ache check koro
- Status "Valid Configuration" hoye thakte hobe. Na thakle "Refresh" click koro
- Jodi domain onno project e attached dekhay → oitar theke remove kore ei project e add koro

**Step 3 — DNS verify koro (tomar domain registrar e — Namecheap/GoDaddy jekhane kinecho)**
- A record: `@` → `76.76.21.21`
- CNAME: `www` → `cname.vercel-dns.com`
- propagation check: dnschecker.org

**Step 4 — Environment variables**
- Settings → **Environment Variables** → Production scope e shob required vars ache verify koro (Supabase URL, anon key, etc.)
- Missing thakle add koro, tarpor redeploy lagbe

**Step 5 — Verify**
- `coachrony.com` ar `www.coachrony.com` dutoi browser e khulo (incognito), 404 chole jaowa uchit

---

## Option B: coachrony.com Lovable e niye aso (permanent fix, kintu site content replace hobe)

Jodi coachrony.com **eii Lovable project er e production domain hoyar kotha thake**, tahole Vercel bypass kore Lovable e connect kore dao:

1. Lovable: **Project Settings → Domains → Connect Domain** → `coachrony.com` enter koro
2. Registrar e DNS update koro:
   - A record `@` → `185.158.133.1`
   - A record `www` → `185.158.133.1`
   - TXT record `_lovable` → Lovable je value dibe
3. Verify hote 5 min – 72 hr lagte pare, tarpor SSL auto-provision hobe
4. Vercel project ta old hoye jabe — chaile delete koro

**Warning:** Eta korle coachrony.com er **purono Vercel content gone hoye jabe**, ei Lovable project ja ache (coachronyacademy) seta dekhabe. Dutotai shame app hole tik ache, alada hole content harabe.

---

## Ami next ki korte pari

- Tumi bolo **Option A** na **Option B** — A hole ami shudhu guide diye shesh, B hole ami custom domain setup flow chalu kore dibo (build mode lagbe)
- Vercel theke je error/log paocho seta pathaile ami sheta analyze kore specific fix suggest korte pari

Lovable project e code change er kono prayojon nei — eta purely deployment/DNS issue.