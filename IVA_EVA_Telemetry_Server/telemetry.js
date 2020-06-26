class Telemetry {
    constructor(telemetry) {
        // Sort Telemetry first before initializing the object
        this.sortTelemetry(telemetry);
        this.telemetry = telemetry;
    }
    getTelemetrySnapShot() {
        return this.telemetry;
    }
    setTelemetrySnapshot(telemetry) {
        // This function simulates changes in telemetry data
        for (var id in telemetry) {
            var stream = telemetry[id];
            // If we have min and max values, set random values in this range
            if (stream.min && stream.max) {
                // Generate random number
                var randomValue = this.generateRandomInteger(stream.min, stream.max);
                stream.value = randomValue;
            } else {
                // Use this block for telemetry that does not have min and max values
                if (stream.data === 'Amp Indicator') {
                    if (stream.value === 'High!') {
                        stream.value = 'Low';
                    } else {
                        stream.value = 'High!';
                    }

                }
            }
        }

        // this.telemetry = telemetry;
    }
    sortTelemetry(telemetry) {
        // Insertion Sort
        for (var i = 1; i < Object.keys(telemetry).length; i++) {
            var j = i;
            while (j > 1) {
                var stream = telemetry[j];
                var prev = telemetry[j - 1];
                // Calculate telemetry importance score
                var currentScore = (3 * stream.tier) + (2 * stream.subTier) + (1 / stream.subSubTier);
                var prevScore = (3 * prev.tier) + (2 * prev.subTier) + (1 / prev.subSubTier);
                // Swap streams based on score
                if (currentScore < prevScore) {
                    var tempStream = stream;
                    stream = prev;
                    prev = tempStream;
                }
                j -= 1;
            }
        }
        // Selection Sort
        // var currentIndex = 1;
        // while (currentIndex < Object.keys(telemetry).length - 1) {
        //     var potentialSmallestIndex = currentIndex;
        //     for (var i = currentIndex + 1; i < Object.keys(telemetry).length; i++) {
        //         var stream = telemetry[i];
        //         var prev = telemetry[potentialSmallestIndex];
        //         // Calculate telemetry importance score
        //         var currentScore = (3 * stream.tier) + (2 * stream.subTier) + (1 / stream.subSubTier);
        //         var prevScore = (3 * prev.tier) + (2 * prev.subTier) + (1 / prev.subSubTier);
        //         // Swap streams based on score
        //         if (currentScore < prevScore) {
        //             potentialSmallestIndex = i;
        //         }
        //     }
        //     var stream = telemetry[currentIndex];
        //     var prev = telemetry[potentialSmallestIndex];
        //     var tempStream = stream;
        //     stream = prev;
        //     prev = tempStream;
        // }

    }
    generateRandomInteger(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
module.exports = Telemetry;