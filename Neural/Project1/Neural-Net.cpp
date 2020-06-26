/**
 * from a tutorial https://www.youtube.com/watch?v=KkwX7FkLfug
 * XOR training
 * TODO: Add error checking... everywhere.
 * get random files from trainign data
**/

#pragma warning(disable : 4996) //_CRT_SECURE_NO_WARNINGS#include <iostream>
#include "TrainingData.h"
#include "NeuralNet.h"
#include "Misc.h"
#include "Reader.h"
#include <iostream>

using namespace std;

TrainingData top;
TrainingData TDExpectedOut;
TrainingData TDIn;
vector<double> inputVals, targetVals, resultVals;
vector<unsigned> topology;//array of values for amount of layers in the net
Net myNet;

void train() {
	for (int TP = 0; TP < 100; ++TP) {//TP = training pass
		//while (!TDIn.isEof()) {
		cout << endl << "Pass " << TP << endl;

		//get new input data and feed it forward;
		if (TDIn.getNextInputs(inputVals) != topology[0]) {
			cout << "break # o inputs: " << TDIn.getNextInputs(inputVals) << endl;
			cout << "break topology: " << topology[0] << endl;
			break;
		}
		//showVectorVals(": Inputs:", inputVals);//displays input values
		myNet.feedForward(inputVals);

		//collect the net's actual results:
		myNet.getResults(resultVals);
		showVectorVals("Outputs", resultVals);

		//trian the net what the ouptus should have been:
		TDExpectedOut.getTargetOutputs(targetVals);
		showVectorVals("Targets:", targetVals);

		//change to new function that gets output based on image name from other file
		//depending on which item it is, make 1 through 10 all zeroes excet for the place designated for the image type as 1

		assert(targetVals.size() == topology.back());//make sure topology is correct

		myNet.backProp(targetVals);

		//report how well the training is working averaged over recent
		cout << "net recent average error: "
			<< myNet.getRecentAverageError() << endl;
	}
}
void predict() {
	for (int TP = 0; TP < 1; ++TP) {
		cout << endl << "Pass " << TP << endl;

		if (TDIn.getNextInputs(inputVals) != topology[0]) {
			abort();
		}
		myNet.feedForward(inputVals);

		myNet.getResults(resultVals);
		showVectorVals("Outputs", resultVals);

		//not needed here but included for testing
		TDExpectedOut.getTargetOutputs(targetVals);
		showVectorVals("Targets:", targetVals);
	}
}

int main() {
	string imgName;// = "3";

	int topo[3] = { 10000, 100, 20 };//using 4 as length
	topologyGen(topo, 3);//makes topology to use

	//string in = "image";
	string in = "image";
	in.append(".txt");
	string expOut = "Expected";
	expOut.append(".txt");

	top.open("topology.txt");
	top.getTopology(topology);
	myNet.genNet(topology);

	cout << endl << "Done setting up NN" << endl;

	bool i = true;
	do {

		TDExpectedOut.open(expOut);
		TDIn.open(in);

		cout << endl << "2 for image, 1 for trian, 0 for predict" << endl;
		int inp;
		cin >> inp;
		switch (inp) {
		case 0:
			predict();
			break;
		case 1:
			train();
			myNet.writeWeight();//writes created weights to file
			break;
		case 2:
			//write 2 in correct place (all others zero) in training data file
			//(2 rather than one to make it more dramatic a difference?)

			//if this fails, convert the "segmentation class" images and use those
			//if segmentation works, edge detection and image modification will be nessacary, possibly
			for (int i = 1; i < 9963; i++) {
				if (i < 10) {
					imgName = "00000";
				}
				else if (i > 9 && i < 100) {
					imgName = "0000";
				}
				else if (i > 99 && i < 1000) {
					imgName = "000";
				}
				else if (i > 999 && i < 10000) {
					imgName = "00";
				}
				imgName.append(to_string(i));
				if (fileExists(imgName+".bmp")) {
					image(imgName);
				}
			}
			break;
		default:
			i = false;
			break;
		}

		TDIn.close();
		TDExpectedOut.close();
	} while (i);

	//compare output vals and depending on which one is highest depends on what program outputs

	//Input layer should be array size of largest image from dataset (will be one size as allimages will be the same size from true training)
}
