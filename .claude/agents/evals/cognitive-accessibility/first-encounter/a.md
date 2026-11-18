# Batch Overhead Amplification

How smaller batches uncover performance bottlenecks

A proposed repair cut a banking app’s account-list loading time from **more than half a minute to a few seconds** in a local test. The repair reconstructed the account history once, instead of starting again for every page of results.

![The same 51,015 source records took 35.5 seconds before the repair, 3.80 seconds with output reuse and 4.51 seconds in the later version that limited the results kept between pages. These were individual local synthetic runs.](a.svg)
