# Choosing an API page size

The API returns records in pages. We compared pages of 50 and 200 records using the same database query and the same 2,000 records. Both requests completed in about one second. We kept the existing page size of 50: this test showed no useful improvement from changing it.
