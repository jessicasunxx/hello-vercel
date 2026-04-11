# User Study Report — Meme Gallery App

## User Study 1 — Kevin Zhu

### 1. User Information

- **Relationship to the user:** Friend  
- **Prior use of this app:** None  
- **Experience with similar applications:** A lot — he’s used tons of normal websites, OAuth stuff, galleries, that kind of thing  

### 2. Observation Context

- **Where the study took place:** Library, in person  
- **Device used:** Laptop, Chrome  
- **Instructions given:** I just told him it’s for class and it’s a meme gallery app, use it like you normally would and try the main stuff  
- **Tasks:** Kind of half structured — I asked him to sign in, look around, open a meme, vote once, and see if he could find sign out / upload. After that he could do whatever  

### 3. Three Things the User Liked (Functionality Only)

1. He figured out fast that the first page is basically just a landing page and the big button is how you get in.  
2. Google login was normal for him, he didn’t need me walking him through OAuth or anything.  
3. Once the gallery loaded he said the grid made sense and the cards looked clickable like other sites he uses  

### 4. Three Areas for Improvement

1. He thinks if you hit the “protected” screen it should say more clearly *why* you need an account, not just that its locked  
2. Upload and account stuff should maybe live in a header or somewhere you always see it, he had to look around a bit  
3. For voting maybe a tiny hint the first time would help people who don’t poke around the modal — like what the buttons actually do  

### 5. Observed Friction or Confusion

- He paused on the home page for a second deciding between the main button vs looking for other links, not a big deal  
- No wrong clicks really, he went home → login → google → gallery pretty straight  
- He asked if voting saves automatically or if you have to do something extra, so he wasn’t 100% sure it “stuck”  

### 6. Behavioral Observations

- First thing he looked at was the title area and the main button  
- Login was quick, he used the trackpad fine  
- He clicked a bunch of memes, voted, scrolled the whole grid, found sign out on his own  
- Upload he found after scanning down the page not right away, overall he seemed pretty comfortable  

### 7. User Quotes (Optional)

- “Yeah it’s pretty standard once you get past the first page.”  
- “I wasn’t sure my vote counted until I clicked again and saw it change.”  
- “I’d put upload up by the title honestly, I don’t wanna hunt for it.”  

---

## User Study 2 — Jasmine

### 1. User Information

- **Relationship to the user:** Friend  
- **Prior use of this app:** None  
- **Experience with similar applications:** Not much — she uses apps on her phone all the time but not really random student websites or OAuth type things  

### 2. Observation Context

- **Where the study took place:** Library, same as the others  
- **Device used:** Laptop, she borrowed mine, Safari  
- **Instructions given:** I said try to use the memes and the app, don’t wait for me to tell you every step, if your stuck just say what your thinking  
- **Tasks:** Mostly let her explore, I only stepped in if she was stuck like a full minute  

### 3. Three Things the User Liked (Functionality Only)

1. She said “sign in with google” made it obvious what to press next  
2. She liked that you can see a bunch of pictures at once in the grid  
3. When she opened one the vote buttons looked like actual buttons which helped  

### 4. Three Areas for Improvement

1. She didn’t totally get at first *why* clicking the link sent her to a sign in wall, needs a sentence on the home page maybe  
2. When it jumped to Google she got nervous, a note like “you’ll leave the site for a second” might of helped  
3. Upload was easy to miss cause it’s lower on the page under everything  

### 5. Observed Friction or Confusion

- After she clicked “View Supabase Data” she read the protected message twice  
- When Google opened she looked at me like “is this right” before continuing  
- She didn’t really get lost besides that  
- She asked if it mattered which google account (school vs personal)  

### 6. Behavioral Observations

- She looked at the biggest text and button first  
- She reads everything on the screen before clicking usually  
- After login she stayed in the main flow, didn’t try random urls or whatever  
- She scrolled memes for a while before noticing upload  
- Took a nudge on the oauth part but finished everything  

### 7. User Quotes (Optional)

- “I thought I broke it when it went to Google.”  
- “Ohhh I have to sign in first, ok that makes sense.”  
- “I didn’t see where to add my picture til I scrolled back up.”  

---

## User Study 3 — Michelle Zhou

### 1. User Information

- **Relationship to the user:** Classmate  
- **Prior use of this app:** Minimal, she saw like a quick demo one time before  
- **Experience with similar applications:** A little — Instagram, Canvas, normal apps, not a ton of student coded sites  

### 2. Observation Context

- **Where the study took place:** Library  
- **Device used:** Laptop Chrome  
- **Instructions given:** Sign in, use the gallery, try voting, and if you find upload try that too, think out loud if its confusing  
- **Tasks:** Some steps I told her + a few minutes just browsing  

### 3. Three Things the User Liked (Functionality Only)

1. Dark mode was easier to read in the library lights  
2. The popup made it obvious which meme your looking at compared to the grid behind it  
3. Nothing felt super slow when clicking around or voting  

### 4. Three Areas for Improvement

1. After oauth she wanted to know “am I on home or gallery” more clearly, breadcrumbs or something  
2. Word “Supabase” on the button confused her, she doesn’t know what that is  
3. Sign out felt small compared to the big header  

### 5. Observed Friction or Confusion

- She hovered on the vote buttons a second before picking one  
- She hit browser back once after google then figured out to use the site  
- She wasn’t sure if closing the popup undid her vote (it didn’t)  
- Asked how you know your still logged in if you come back later  

### 6. Behavioral Observations

- Looked at the gallery title and the meme count then the grid  
- Mix of scroll and click, opened several in a row  
- Voted on more than one without me asking  
- Upload she only found after I asked her to look for it, not in the first minute on her own  
- Mostly confident but paused on login stuff  

### 7. User Quotes (Optional)

- “It’s clear which picture I’m on in the pop up.”  
- “What is Supabase?? Is that for me to click?”  
- “Where’s log out… oh ok there.”  

---

## Final Summary (After All 3 Studies)

### What I learned from observing users

Kevin flew through everything cause he’s used to this type of flow but he still wanted the app to *show* that voting saved, not just assume you know. Jasmine needed more hand holding emotionally around leaving for Google even though she could complete the steps. Michelle was in the middle but jargon on the homepage and “where am I” after sign in tripped her up more than Kevin. So like technical vs non technical people had different pain points but everyone still had small confusion about persistence / feedback.

### What I found surprising

- Michelle had seen a demo before and she still wasn’t sure about back button vs staying in the app after oauth  
- Jasmine’s issue was mostly the redirect feeling scary not that she couldn’t do it, which I didn’t expect  
- Kevin actually gave the most “big picture” comments about layout even though he was the fastest user  

### Patterns across multiple users

1. **Auth:** All 3 signed in fine but 2 of them had a moment of “is this broken / is this safe” around Google  
2. **Finding stuff:** Upload and sign out were always findable eventually but people had to scroll or search, wasn’t obvious at first glance  
3. **Voting:** Multiple people hesitated or asked if the vote “counts” — needs clearer feedback in the UI  

### Planned improvements (at least three)

1. **Copy on home + gate:** Explain you need an account for the gallery and that google will open in a new step / redirect  
2. **Layout:** Put upload and sign out nearer the top by the title so you don’t have to scan the whole page  
3. **Voting + session:** Make the voted state super obvious on the buttons, maybe tiny text “saved” or color change; show signed in email more clearly so people trust the session  
4. **Less jargon:** Change “View Supabase Data” to normal people words so Michelle / Jasmine aren’t confused what they’re clicking  

