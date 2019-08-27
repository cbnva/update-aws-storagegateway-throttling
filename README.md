# Update AWS Storage Gateway Throttling

I needed to dynamically adjust the bandwidth on an AWS Storage Gateway based on the time of day so that other services remained responsive.
AWS nicely didn't have a way to do that, so I wrote one myself.

It runs as an AWS lambda function with `node.js`.

[Step by Step Setup](https://github.com/cbnva/update-aws-storagegateway-throttling/wiki/Step-by-Step-Setup)
