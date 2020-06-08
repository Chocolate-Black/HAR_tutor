import numpy as np
from scipy.signal import butter, lfilter, freqz
import matplotlib.pyplot as plt
import csv
import pandas as pd

def butter_lowpass(cutoff, fs, order=5):
    nyq = 0.5 * fs
    normal_cutoff = cutoff / nyq
    b, a = butter(order, normal_cutoff, btype='low', analog=False)
    return b, a


def butter_lowpass_filter(data, cutoff, fs, order=5):
    b, a = butter_lowpass(cutoff, fs, order=order)
    y = lfilter(b, a, data)
    return y  # Filter requirements.

# 初始数据设置
order = 5 #巴特沃斯滤波器阶数
fs = 50 # 采样频率
cutoff = 15 # 截止频率
b, a = butter_lowpass(cutoff, fs, order) # Plot the frequency response.


# load data
raw_data = list()
with open("all_data.csv","r") as f:
    data = csv.reader(f)
    i = 0
    for row in data:
        if i == 0:
            i += 1
            continue
        else:
            r = list()
            for j in range(8):
                if j == 6:
                    continue
                value = row[j]
                r.append(float(value))
            raw_data.append(r)

# 画图，原始数据
raw_data = np.array(raw_data)
plt.figure()
plt.plot(raw_data[1152:1280,4])
plt.ylim([-6,6])
plt.show()

# mean filter
new_data = list()
for i in range(len(raw_data)):
    new_row = list()
    for j in range(len(raw_data[0])):
        if j == len(raw_data[0])-1:
            new_row.append(raw_data[i,j])
            continue
        if i == 0:
            value = (raw_data[0, j] + raw_data[-1, j] + raw_data[1, j]) / 3
        elif i == (len(raw_data) - 1):
            value = (raw_data[0, j] + raw_data[-1, j] + raw_data[-2, j]) / 3
        else:
            value = (raw_data[i, j] + raw_data[i + 1, j] + raw_data[i - 1, j]) / 3
        new_row.append(value)
    new_data.append(new_row)

new_data = np.array(new_data)

# 画图，均值滤波后
plt.figure()
plt.plot(new_data[1152:1280,4])
plt.ylim([-6,6])
plt.show()

new_data2 = np.zeros([39458,7])
for i in range(len(new_data[0])):
    if i == len(new_data[0])-1:
        new_data2[:,i] = new_data[:,i]
        continue
    y = butter_lowpass_filter(new_data[:,i], cutoff, fs, order)
    new_data2[:,i] = y

# 画图，巴特沃斯滤波后
plt.figure()
plt.plot(new_data2[1152:1280,4])
plt.ylim([-6,6])
plt.show()

# 数据切片并保存
def save_train_data(final_data):
    for i in range(len(final_data[0])-1):
        j = 0
        length = len(final_data)
        output = list()
        while (j + 127) < length:
            extract = list()
            classes = [0,0,0,0,0,0]
            for k in range(128):
                extract.append(final_data[j + k, i])
                id = final_data[j+k,-1]
                classes[int(id)] += 1
            extract.append(classes.index(max(classes)))
            # print(extract)
            output.append(extract)
            j = j + 64
        df = pd.DataFrame(output)
        df.to_csv("train_data_col{0}.csv".format(i))
        print("train_data_col{0}.csv".format(i) + "is saved.")

save_train_data(new_data2)







