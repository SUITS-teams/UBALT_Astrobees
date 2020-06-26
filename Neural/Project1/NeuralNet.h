#include <cstdlib>
#include <cassert>
#include <math.h>
#include <vector>
#include <fstream>
#include <sstream>
#include "Misc.h"
#include <iostream>

using namespace std;

struct Neuron;
struct Connection {//stores weight and change in the weight
	double weight;
	double deltaWeight;
};

typedef vector<Neuron> Layer;

vector<string> fileWeights;
string filename = "weights.txt";

//********** struct Neuron **********

struct Neuron {
public:
	Neuron(unsigned laya, unsigned numOutputs, unsigned myIndex, const vector<unsigned>& topology);//needs to know the number of neurons in the next layer
	void setOutputVal(double val) { m_outputVal = val; }
	double getOutputVal(void) const { return m_outputVal; }
	void feedForward(const Layer& prevLayer);
	void calcOutputGradients(double targetVal);
	void calcHiddenGradients(const Layer& nextLayer);
	void updateInputWeights(Layer& prevLayer);//modifys previous layer
	double* getNeuronWeight(int l, int n, Layer& prevLayer);
	vector<double> getWeightFromFile(int lay, int neur, const vector<unsigned>& topology);

private:
	static double eta;// [0.0..1.0] overall net training rate
	static double alpha;// [0.0..n] multiplier of last weight change (momentum)
	static double transferFunction(double x);// can be different things (like a step funciton). Typically sigmoid funciton
	static double transferFuncitonDerivative(double x);
	static double randomWeight(void) { return rand() / double(RAND_MAX); }//can change late (for calculated randomness)
	double sumDOW(const Layer& nextLayer) const;
	double m_outputVal;
	vector<Connection> m_outputWeights;
	unsigned m_myIndex;
	double m_gradient;
};

//learner rate
double Neuron::eta = 0.15;//can experiment with different values
//momentum
double Neuron::alpha = 0.1;//can experiment with different values

/*
* Param prevLayer: used to get neurons from previous layer to change their weights
* their weights changed based on several factors, including their prior change in wieght
*
* Use: update weights of NN during back propogation
*/
void Neuron::updateInputWeights(Layer& prevLayer) {
	//the wieghts to be updated are in the Connection container
	//in the neurons in the preceding layer

	for (unsigned n = 0; n < prevLayer.size(); ++n) {
		Neuron& neuron = prevLayer[n];//other neuron in prev layer
		double oldDeltaWeight = neuron.m_outputWeights[m_myIndex].deltaWeight;

		double newDeltaWeight =
			//individual input. magnified by the gradient and train rate;
			eta//learner rate (0.0 - slow, 0.2 - medium, 1.0 reckless)
			* neuron.getOutputVal()
			* m_gradient
			//also add momentum = a fraction of the previous delta weight
			+ alpha //momentum (0.0 - no momentum, 0.5 moderate momentum)
			* oldDeltaWeight;

		neuron.m_outputWeights[m_myIndex].deltaWeight = newDeltaWeight;
		neuron.m_outputWeights[m_myIndex].weight += newDeltaWeight;
		//cout << "new delta: " << neuron.m_outputWeights[m_myIndex].deltaWeight << " | weight: " << neuron.m_outputWeights[m_myIndex].weight << endl;
	}
}

/*
* Param nextLayer: used to get neurons from next layer to see their gradients
*
* Use: establish the differences in weights compared to graidents of the next layer
*/
double Neuron::sumDOW(const Layer& nextLayer) const {
	double sum = 0.0;
	//sum our contributions of the errors at the nodes we feed

	for (unsigned n = 0; n < nextLayer.size() - 1; ++n) {
		sum += m_outputWeights[n].weight * nextLayer[n].m_gradient;//from our neuron to the other neuron
	}
	return sum;
}

/*
* Param nextLayer: used to get neurons from next layer to pass into sumDOW()
*
* Use: calculate the gradients between neurons in the hidden layers
*/
void Neuron::calcHiddenGradients(const Layer& nextLayer) {
	double dow = sumDOW(nextLayer);//difference of weights
	m_gradient = dow * Neuron::transferFuncitonDerivative(m_outputVal);
}

/*
* Param targetVal: find difference between target and what the NN output
*
* Use: calculate what gradient should be based on output
*/
void Neuron::calcOutputGradients(double targetVal) {
	//different ways to calculate graidents
	//reduces overall net error
	double delta = targetVal - m_outputVal;
	m_gradient = delta * Neuron::transferFuncitonDerivative(m_outputVal);
}

/*
* Param x: value to be calculated
*
* Use: "squishes" value to find where it is along a graph (used to find lowst value of the "graph")\
* feed forward
*/
double Neuron::transferFunction(double x) {
	//for future: hyperbolic function: tanh-output range [-1.0..1.0]
	//hyperbolic: tanh x =(e^(x) - e^(-x)) / (e^(x) + e^(-x))
	//or: tanh(x)

	//return tanh(x);

	//appparently hyperbolic and sigmoid both take about 5.5 nanoseconds

	//sigmoid:
	return sig(x);//sigmoid
}

/*
* Param x: value to be calcualted
*
* Use: find derivation of transferFunction()
* backpropogation
*/
double Neuron::transferFuncitonDerivative(double x) {
	//hyperbolic
	//return 1.0 - x * x;

	//sigmoid
	return (sig(x) * (1 - sig(x)));
}

/*
* Param prevLayer: number made based on previous layer's output
*
* Use: uses previous layers calculated output to put into current layer
*/
void Neuron::feedForward(const Layer& prevLayer) {
	double sum = 0.0;
	//Sum the previous layer's outputs (which are our inputs)
	//include th ebias node from the previous layer

	for (unsigned n = 0; n < prevLayer.size(); ++n) {//math each neuron (includes bias because bias does feed)
		sum += prevLayer[n].getOutputVal() *
			prevLayer[n].m_outputWeights[m_myIndex].weight;// m_outputweights[ how it knows which neuron it is ]

	}
	//cout << "Layer: " << prevLayer.size() << endl;
	//cout << "sum Before: " << sum << endl;




	//this is not the way. But, a number bigger than 9 breaks in the sigmoid funciton



	/*



	//negative
	if (sum < 0) {
		sum = sum;
	}
	else if (sum < -9) {
		sum = sum / 100;
	}
	else if (sum < -99) {
		sum = sum / 1000;
	}
	else if (sum < -999) {
		sum = sum / 10000;
	}
	else if (sum < -9999) {
		sum = sum / 100000;
	}
	else if (sum < -99999) {
		sum = sum / 1000000;
	}
	else if (sum < -999999) {
		sum = sum / 10000000;
	}
	else if (sum < -9999999) {
		sum = sum / 100000000;
	}
	else if (sum < -99999999) {
		sum = sum / 1000000000;
	}
	else if (sum < -999999999) {
		sum = sum / 10000000000;
	}
	//positive
	else if (sum > 99999999) {
		sum = sum / 1000000000;
	}
	else if (sum > 9999999) {
		sum = sum / 100000000;
	}
	else if (sum > 999999) {
		sum = sum / 10000000;
	}
	else if (sum > 99999) {
		sum = sum / 1000000;
	}
	else if (sum > 9999) {
		sum = sum / 100000;
	}
	else if (sum > 999) {
		sum = sum / 10000;
	}
	else if (sum > 99) {
		sum = sum / 1000;
	}
	else if (sum > 9) {
		sum = sum / 100;
	}
	/*
	//decimal
	else if (sum < .000000001) {
		sum = sum * 100000000;
	}
	else if (sum < .00000001) {
		sum = sum * 10000000;
	}
	else if (sum < .0000001) {
		sum = sum * 1000000;
	}
	else if (sum < .000001) {
		sum = sum * 100000;
	}
	else if (sum < .00001) {
		sum = sum * 10000;
	}
	else if (sum < .0001) {
		sum = sum * 1000;
	}
	else if (sum < .001) {
		sum = sum * 100;
	}
	else if (sum < .01) {
		sum = sum * 10;
	}
	

	*/


	
	//cout << "Sum: " << sum << endl;
	//cout << "Sig: " << sig(sum) << endl;
	//cout << endl;
	m_outputVal = Neuron::transferFunction(sum);
}

/**
* Param l: Layer that neuron is in
* Param n: neuron to get
* param thisLayer: the layer object that neuron is in
*
* Use: get neuron's weights to save to file
*/
double* Neuron::getNeuronWeight(int l, int n, Layer& thisLayer) {
	int h = thisLayer[n].m_outputWeights.size() + 1;// amount of weights in neuron (+1 because arrays need one over)
	double* hold = new double[h];// to hold the weight values in the neuron
	hold[0] = h;//put size of array as first value
	for (int w = 1; w < h; w++) {
		hold[w] = m_outputWeights[w - 1].weight;// -1 due to how arrays work and that the first place is the place number
	}
	return hold;
}

/**
* Param lay: layer neuron is in
* Param neur: neuron weights are saved in

* Return: array of wieghts

* Use: returns weights saved in array
*/
vector<double> Neuron::getWeightFromFile(int lay, int neur, const vector<unsigned>& topology) {//c is how many weights per neuron

	vector<double> neuronWeight;

	int place;//place that neuron is at
	int numONeur = 0;// amount of weights in neuron

	//based on topology, set place
	switch (lay) {
	case 0:
		numONeur = topology[1];
		if (neur == 0) {
			place = 0;
		}
		else {
			place = neur;
		}
		break;
	case 1:
		if (topology.size() > 2) {
			numONeur = topology[2];
		}
		else {
			numONeur = 0;
		}
		place = topology[0];//length of first layer plus one
		if (neur == 0) {
			place += 1;
		}
		else {
			place += 1 + neur;
		}
		break;
	case 2:
		if (topology.size() > 3) {
			numONeur = topology[3];
		}
		else {
			numONeur = 0;
		}
		place = topology[0] + topology[1]+1;//length of first layer plus one
		if (neur == 0) {
			place += 1;
		}
		else {
			place += 1 + neur;
		}
		break;
	case 3:
		numONeur = 0;
		place = topology[0] + topology[1]+topology[2]+2;//length of first layer plus one
		if (neur == 0) {
			place += 1;
		}
		else {
			place += 1 + neur;
		}
		neuronWeight = { 0 };
		return neuronWeight;
		break;
	}

	vector<string> q = split(fileWeights[place], ' ');//split array based on where spaces are
	for (int k = 1; k < numONeur + 1; k++) {// start at one to ignore neuron lable
		char* h = new char[q[k].length() + 1];//set length of char holder to string length
		strcpy(h, q[k].c_str());//copy string into char
		neuronWeight.push_back(strtod(h, 0));//add char to double to array list
	}
	return neuronWeight;
}

/**
* Param filename: name of file to be read

* Return: none

* Use: Converts weights saved in a file into an array to be read quickly
*/
void weightToArray(string filename) {
	string line;
	string label;
	vector<string> neuronWeight;

	std::ifstream weightFile;
	weightFile.open(filename.c_str());//appends to open file

	bool found = false;//continue until end of the file is found
	if (weightFile.is_open()) {
		do {
			getline(weightFile, line);
			stringstream ss(line);
			ss >> label;

			neuronWeight.push_back(line);//add line to fileWeights

			if (weightFile.eof()) {
				//cout << "Found!" << endl;
				found = true;
			}
		} while (!found);
		weightFile.close();
	}
	cout << endl;

	fileWeights = neuronWeight;
}

/*
* Param numOutputs: how many neurons to create
* Param myIndex: which neuron is being utilized
*
* Use: creates a neuron
*/
Neuron::Neuron(unsigned laya, unsigned numOutputs, unsigned myIndex, const vector<unsigned>& topology) {
	if (fileExists(filename)) {
		vector<double> wei = getWeightFromFile(laya, myIndex, topology);
		for (unsigned c = 0; c < numOutputs; ++c) {
			m_outputWeights.push_back(Connection());
			m_outputWeights.back().weight = wei[c];
		}
	}
	else {
		for (unsigned c = 0; c < numOutputs; ++c) {//c for connections
			m_outputWeights.push_back(Connection());//append new connection to weights
			m_outputWeights.back().weight = randomWeight();//random training (could make connection a class that has its own constructor that gives itself a random weight when constructed)
		}
	}
	m_myIndex = myIndex;
}

//************ struct Net **********

struct Net {//higher level than neuron class
public:
	Net() {};
	void genNet(const vector<unsigned>& topology);
	void feedForward(const vector<double>& inputVals);
	void backProp(const vector<double>& targetVals);
	void getResults(const vector<double>& resultVals) const;
	void getResults(vector<double>& resultVals) const;
	double getRecentAverageError(void) const { return m_recentAverageError; };
	void writeWeight();

private:
	vector<Layer> m_layers; //a vector of layers. m_layers[layerNum][neuronNum] first reference is layer, second is the neron in the layer
	double m_error;
	double m_recentAverageError;
	static double m_recentAverageSmoothingFactor;
};

double Net::m_recentAverageSmoothingFactor = 100.0; // number of training samples to average over

/*
* Param resultVals: results of NN calculation
*
* Use: adds output from neurons to array
*/
void Net::getResults(vector<double>& resultVals) const {
	resultVals.clear();

	for (unsigned n = 0; n < m_layers.back().size() - 1; ++n) {//moves output vals onto result vals
		resultVals.push_back(m_layers.back()[n].getOutputVal());
	}
}

/*
* Param targetVals: put what values should have been to compare to what the neurons think
*
* Use: changes wieghts of neurons to more closely align with a systme that will be the least wrong
*/
void Net::backProp(const vector<double>& targetVals) {
	//calcualte overall net error (RMS of output neuron errors)

	Layer& outputLayer = m_layers.back();
	m_error = 0.0;//accumulate overall net error

	for (unsigned n = 0; n < outputLayer.size() - 1; ++n) {
		double delta = targetVals[n] - outputLayer[n].getOutputVal();//how far off from the target value
		m_error += delta * delta;
	}
	m_error /= outputLayer.size() - 1;//get average error squared
	m_error = sqrt(m_error);//RMS

	//implement a recent average measurement:

	m_recentAverageError =
		(m_recentAverageError + m_recentAverageSmoothingFactor + m_error)
		/ (m_recentAverageSmoothingFactor + 1.0);//print out how well the net has been doing (how well it's being trained)

	//calculate output layer gradients

	for (unsigned n = 0; n < outputLayer.size() - 1; ++n) {
		outputLayer[n].calcOutputGradients(targetVals[n]);
	}

	//calculate gradients on hidden layers

	for (unsigned layerNum = m_layers.size() - 2; layerNum > 0; --layerNum) {//for hidden layers
		Layer& hiddenLayer = m_layers[layerNum];
		Layer& nextLayer = m_layers[layerNum + 1];
		for (unsigned n = 0; n < hiddenLayer.size(); ++n) {//all neurons in hidden layer
			hiddenLayer[n].calcHiddenGradients(nextLayer);
		}
	}

	//for all layers from ouptus to first hidden layer,
	//update ocnnection weights

	for (unsigned layerNum = m_layers.size() - 1; layerNum > 0; --layerNum) {
		Layer& layer = m_layers[layerNum];
		Layer& prevLayer = m_layers[layerNum - 1];

		//cout << endl << "layer: " << layerNum << " | size: " << layer.size() - 1;

		for (unsigned n = 0; n < layer.size() - 1; ++n) {//index each individual neuron
			//cout << endl << "neuron: " << n << endl;
			layer[n].updateInputWeights(prevLayer);
		}
	}
};

/*
* Param inputVals: what values are received from given data
*
* Use: calculates a value(result) based on inputs
*/
void Net::feedForward(const vector<double>& inputVals) {
	assert(inputVals.size() == m_layers[0].size() - 1);//assert what you belive to be true. if number of neurons is the same as the input neurons (-1 for bias)

	//Assign (latch) the input values into the input neron
	for (unsigned i = 0; i < inputVals.size(); ++i) {
		m_layers[0][i].setOutputVal(inputVals[i]);//since m_outputVal is private
	}

	//Forward propagate
	for (unsigned layerNum = 1; layerNum < m_layers.size(); ++layerNum) {//start in hidden layer, go up through output layer
		Layer& prevLayer = m_layers[layerNum - 1];//get previous layer (& is an address operator.  yields a pointer referring to the same object. (faster computing))
		for (unsigned n = 0; n < m_layers[layerNum].size() - 1; ++n) {//address each individaul neuron
			m_layers[layerNum][n].feedForward(prevLayer);//.feedForward does the math
		}
	}
}

/*
* Param topology: how the NN should be structured
*
* Use: creates the structure of the NN
*/
void Net::genNet(const vector<unsigned>& topology) {
	unsigned numLayers = topology.size();//layers from incoming topology object
	if (fileExists(filename)) {//put weights from file into array (for speed) if file exists
		weightToArray(filename);
		cout << "Weights written" << endl;
	}
	for (unsigned layerNum = 0; layerNum < numLayers; ++layerNum) {//loop to create a new layer in m_layers
		m_layers.push_back(Layer());//put layer into m_layers
		unsigned numOutputs = layerNum == topology.size() - 1 ? 0 : topology[layerNum + 1];// if output layer, go no further (output layer has no further outputs). else topology size plus bias

		//loop for putting neurons into created layer
		for (unsigned neuronNum = 0; neuronNum <= topology[layerNum]; ++neuronNum) {// <= to include bias
			m_layers.back().push_back(Neuron(layerNum, numOutputs, neuronNum, topology));//.back gives last element
		}
		//force the biase node output value to 1.0. it's the last neuron created above
		m_layers.back().back().setOutputVal(1.0);
	}
}

/**
* Use: write trained NN wieghts in system to a file to be used later
*/
void Net::writeWeight() {// l = layer, n = neuron
	double* hold;//array that holds values of all weights for each neuron to be written to file

	std::ofstream weights;
	weights.open("weights.txt");//appends to open file

	if (weights.is_open()) {
		for (int i = 0; i < m_layers.size(); i++) {//for all layers but output
			for (int j = 0; j < m_layers[i].size(); j++) {//for each neuron in the layer
				weights << "L" << i << "N" << j << ": ";//for labeling the neuron
				hold = m_layers[i][j].getNeuronWeight(i, j, m_layers[i]);
				for (int k = 1; k < hold[0]; k++) {//place 0 stores the array's size (amount of weights per neuron)
					weights << hold[k] << " ";
				}
				weights << "\n";
			}
		}
		weights.close();
	}
}