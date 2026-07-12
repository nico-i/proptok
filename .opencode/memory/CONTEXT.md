status: MVP built & building green (tsc clean, vite build ok, SW+manifest generated). NOT yet device-verified or tested.
next_session:
  - write tests WITH user: recordingMachine (pure fsm transitions), storage (idb roundtrip), useRecorder (mocked media+storage), component render tests.
  - device verify: install to homescreen -> standalone launch -> lands on camera -> record blinks -> stop -> autoplays -> save->check -> blob in IndexedDB -> relaunch offline still opens.
  - run over HTTPS on phone (dev:https) for camera.
verification_done: npm run typecheck (clean), npm run build (ok, 9 precache entries, navigateFallback=index.html confirmed in dist/sw.js).
verification_blocked: curl denied in env; dev-server HTTP smoke test not run by agent. build is the authoritative check.
deviations_from_plan:
  - Icon set: single Icon.tsx with named exports instead of 5 files (same folder, cleaner). 
  - tsconfig: single file instead of app/node split.
  - added New take button on playback for playback->idle (plan allowed minimal trigger).
git: nothing committed yet (user commits manually per AGENTS.md).
