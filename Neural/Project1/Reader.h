#pragma once
#include <iostream>
using namespace std;

long w = 1;
long h = 1;
int chan = 3;

/**
* Param filename: name of file to be read

* Return: pixel information in file in the form of an array of chars

* Use: reads image
*/
unsigned char* ReadBMP(const char* filename)
{
    int i;
    FILE* f = fopen(filename, "rb");
    unsigned char info[54];
    fread(info, sizeof(unsigned char), 54, f); // read the 54-byte header

    if (*(int*)&info[26] == 1048577) {//includes alpha channel
        chan = 4;
    }
    else if (*(int*)&info[26] == 1572865) {
        chan = 3;
    }

    // extract image height and width from header
    int width = *(int*)&info[18];
    w = width;
    int height = *(int*)&info[22];
    h = height;

    int size = 3 * width * height;

    //cout << "Size: " << (size/3) << " | channels: " << chan << " | width: " << width << " | height: " << height << endl;
    unsigned char* data = new unsigned char[size]; // allocate 3 bytes per pixel
    fread(data, sizeof(unsigned char), size, f); // read the rest of the data at once
    fclose(f);

    for (i = 0; i < size; i += 3) {
        unsigned char tmp = data[i];
        data[i] = data[i + 2];
        data[i + 2] = tmp;
        //cout << data[i] << data[i+2] << data[i+4] <<" ";
    }
    return data;
}

//man and dog images have alpha, logo and gen do not
//use as a holder, not make a file for every image****************************************************************************
/**
* Param monoChrome: array of each pixel in monochrome (one value per pixel)
* Param size: size of image (how many pixels)
* Param img: name if image file

* Use: stores image pixel values into file
*/
void store(double* monoChrome, int size, string img) {

    string s = "";
    s.append(img);
    s.append(".txt");

    std::ofstream myfile;
    myfile.open(s, std::ios_base::app);//appends to open file

    if (myfile.is_open())
    {
        myfile << "in: ";
        for (int count = 0; count < size; count++) {
            myfile << monoChrome[count] << " ";
        }
        myfile << "\n";
        myfile.close();
    }
    else cout << "Unable to open file";
}

//  When averaging chanel values, written value is rounded down
//   This creates an array from bottom left, increase on horizontal then start again 1px up to get next row
/**
* Param name: name of image file
* Param img: name of file to save

* return: size of image
*/
int encode(char const* name, string img) {
    unsigned char* data = ReadBMP(name);
    //uint32_t chan = 24 / 8;//32 if half alpha, 24 if not
    //chan = 32 / 8;
    int r;
    int g;
    int b;
    int ms = w * h;// monochrome size
    double* monoChrome = new double[ms];//empty array with size ms
    int q = 0;//place holder to put into A

    for (int Y = 0; Y < h; Y++) {
        for (int X = 0; X < w; X++) {
            r = (int)data[chan * (Y * w + X) + 0];
            g = (int)data[chan * (Y * w + X) + 1];
            b = (int)data[chan * (Y * w + X) + 2];
            monoChrome[q] = (((r + g + b) / 3));
            //cout << monoChrome[q] << endl;
            monoChrome[q] = (monoChrome[q]/255);
            //cout << monoChrome[q] << endl << endl;
            q++;
        }
    }
    store(monoChrome, q, img);
    return ms;
}

/**
* Param imgName: name of image to be used

* Return: size of image

* Use: turns image into a data file
* Adds data to image file, doesn't replace
*/
int image(string imgName) {
    int size;
    string s1 = imgName;
    s1.append(".bmp");

    char const* name = s1.c_str();
    string img = "image";

    size = encode(name, img);//encodes an image to monochrome then stores that in a text file
    //cout << endl;
    return size;
}