# Project Prompts Log

This document records all user prompts used to build and configure the **ParkSG** Singapore Carpark Tracker application.

---

### Prompt 1: Initial Frontend Application Build
> build a singapore based carpark tracker application that tracks real time carpark lot availability. build just the front end for now. I will integrate the backend connection later.

---

### Prompt 2: GitHub Repository Setup & Push
> git push https://[REDACTED_GH_TOKEN]@github.com/1stbrightmoon/lta-carpark-tracker.git

*(Note: GitHub personal access token masked for security).*

---

### Prompt 3: Serverless LTA DataMall Connection
> 1. add a serverless connection that pulls live data from LTA's datamall using the following endpoints:
>
> # Live carpark lots (HDB + LTA + URA):
> https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
>
> # All requests need the header:  AccountKey: 
>
> 2. store this in /api folder (at project root level)
> 3. include a /health.ts and /carparkavailability.ts within the same subfolder
> 4. do not hardcode any keys, I will include them later.

---

### Prompt 4: Prompts Documentation
> collate all the prompts into filename Prompts.md
