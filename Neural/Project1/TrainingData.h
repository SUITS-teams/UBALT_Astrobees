#include <fstream>
#include <sstream>
#include <vector>
#include <iostream>

using namespace std;

struct TrainingData {
public:
	TrainingData() {};
	void open(const string fileneme);
	bool isEof(void) { return m_trainingDataFile.eof(); }
	void getTopology(vector<unsigned>& topology);
	//returns the number of input values read from the file:
	unsigned getNextInputs(vector<double>& inputVals);
	unsigned getTargetOutputs(vector<double>& targetOoutputVals);
	void close();

private:
	ifstream m_trainingDataFile;
	ifstream m_expetedOutputDataFile;
	ifstream m_imageDataFile;
};

/*TrainingData::TrainingData(const string filename) {
	m_trainingDataFile.open(filename.c_str());
}*/
void TrainingData::open(const string filename) {
	m_trainingDataFile.open(filename.c_str());
}

void TrainingData::getTopology(vector<unsigned>& topology) {
	string line;
	string label;

	getline(m_trainingDataFile, line);
	//cout << "getline: " << getline(m_trainingDataFile, line) << endl;
	stringstream ss(line);
	cout << "line: " << line << endl;
	ss >> label;
	cout << label << endl;
	if (this->isEof()) {
		cout << "topology error is isEof, label: " << label << endl;
		//abort();
	}
	else if (label.compare("topology:") != 0) {
		cout << "topology error is compare, label: " << label << endl;
		abort();
	}

	while (!ss.eof()) {
		unsigned n;
		ss >> n;
		topology.push_back(n);
	}

	return;
}

unsigned TrainingData::getNextInputs(vector<double>& inputVals) {
	inputVals.clear();

	string line;
	getline(m_trainingDataFile, line);
	stringstream ss(line);

	string label;
	//cout << line;
	ss >> label;

	//cout << label << endl;
	double oneValue;
	if (label.compare("in:") == 0) {
		while (ss >> oneValue) {
			//cout << oneValue << " | ";
			inputVals.push_back(oneValue);
		}
	}
	return inputVals.size();
}

unsigned TrainingData::getTargetOutputs(vector<double>& targetOutputVals) {
	targetOutputVals.clear();

	string line;
	getline(m_trainingDataFile, line);
	stringstream ss(line);

	string label;
	ss >> label;
	if (label.compare("out:") == 0) {
		double oneValue;
		while (ss >> oneValue) {
			targetOutputVals.push_back(oneValue);
		}
	}

	return targetOutputVals.size();
}

void TrainingData::close() {
	m_trainingDataFile.close();
}

void topologyGen(int size[4], int length) {
	
	ofstream myfile("topology.txt");
	if (myfile.is_open())
	{
		myfile << "topology:";
		for (int i = 0; i < length; i++) {
			myfile << " " << size[i];
		}
		myfile.close();
	}
	else cout << "Unable to open file";
}