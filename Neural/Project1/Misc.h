#pragma once
//#include <MsXml.h>
#include <iostream>

using namespace std;

/*
* Param label: lable of line
* Param v: valuse

* Use: show values based on label
*/
void showVectorVals(string label, vector<double>& v) {
    cout << label << " ";
    for (unsigned i = 0; i < v.size(); ++i) {
        cout << v[i] << " ";
    }
    cout << endl;
}

/**
* Param name: name of file

* Return: boolean of if file exists
*/
bool fileExists(const std::string& name) {
    struct stat buffer;
    return (stat(name.c_str(), &buffer) == 0);
};

/**
* Param s: string to be split
* Param delimeter: what char splits the string

* Return: array of strings split by delimeter
*/
vector<string> split(string s, char delimeter) {//split strings
    stringstream ss(s);
    string item;
    vector<string> splittedStrings;
    while (getline(ss, item, delimeter)) {
        splittedStrings.push_back(item);
    }
    return splittedStrings;
}

//sigmoid funciton
const double EULER = std::exp(1.0);
static double sig(double x) { return (1 / (1 + pow(EULER, -x))); }


//it cant exponen sug a big number