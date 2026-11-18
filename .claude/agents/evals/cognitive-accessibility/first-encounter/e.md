# Keeping calculated balances for the next page

We tried two versions. **Output reuse** keeps the calculated account balances so the next page can use them. **Stored results limited** adds a cap on the memory set aside for those balances. If the cap is reached, the app calculates them again when needed.

| Version | What happens between pages |
| --- | --- |
| Output reuse | Calculated balances remain available. |
| Stored results limited | Balances remain available within the memory cap. |
