# Praxis Research

As part of ESC101 (Praxis I) at the University of Toronto, our team had to reduce contamination rates of campus garbage and recycling bins. We decided to create and share a online simulation to test different candidate designs. I was responsible for creating the simulation website and analysing the data.

Try out the simulation [here](https://staadecker.github.io/praxis/).

## Implementation details
The website is a minimal Javascript/HTML page that uploads the users' experiment data to Google's Firebase Storage service. I then downloaded the data and analysed it with MatLab.

## Results

173 responses were recorded as of November 27th 2019. 156 responses were valid (did not exceed more than 15s per item).

The most significant result was that our improved labelling decreased contamination rate—the amount of wrongly placed items—by 11% compared to the current bins. See the graph below.

![contamination_rate_data](/analysis/results/occurence_of_mistakes.png)

## Known Issues

Due to the very short time frame given to implement this project the following occured.
- The code is messy (especially the MatLab code).
- In the website, there is no seperation between development and production code making it hard to make significant changes to the code after its launch.

## Notes for myself

How to copy data from firebase:

`gsutil -m cp -r gs://praxis-i-research.appspot.com "C:\Users\machs\Documents\praxis_data"`

In `res/myhal_bin.svg` the coffee and containers ids are switched. This means that data is flipped.
It is corrected in the analysis.
