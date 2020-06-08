import json
import csv
import numpy as np
from matplotlib import pyplot as plt


def saveData(filename,id): # 把json文件转换为csv格式，id代表着该动作对应的数字编码
    path1 = filename + ".json"
    path2 = filename + ".csv"
    with open(path1, 'r', encoding="utf-8") as f:
        data = f.readlines()

    with open(path2, 'w', newline='') as f2:
        f_csv = csv.writer(f2)
        new_data = list()
        headers = ['xacc', 'yacc', 'zacc', 'xgyr', 'ygyr', 'zgyr', 'name','class'] #表头数据
        for row in data:
            content = json.loads(row)
            # 以下这几步是为了保证加速度的数据和角速度的数据长度相等。因为我的采集小程序的代码有一些不足，
            # 所以导致采集加速度和角速度并不是完全同步，会有20~40ms的延迟。
            # 因此这里需要把数据的长度统一。如果你自己开发的采集数据的小程序不存在数据长度不一致的情况，可以不用做以下步骤
            diff = list()
            diff.append(len(content['xacc']) - len(content['xgyr'])) # 计算加速度和角速度数据的长度差，如果过大则不用该数据
            diff.append(len(content['yacc']) - len(content['ygyr']))
            diff.append(len(content['zacc']) - len(content['zgyr']))
            if diff[0] > 2 or diff[1] > 2 or diff[2] > 2: #如果误差过大，直接忽略
                continue
            elif content['hands'] != "left": # 我这里只选取左手拿手机测试的数据，可以根据实际情况调整
                continue
            else:
                for i in range(len(content['xgyr'])): # 保存数据
                    new_row = list()
                    new_row.append(content['xacc'][i + diff[0]])
                    new_row.append(content['yacc'][i + diff[0]])
                    new_row.append(content['zacc'][i + diff[0]])
                    new_row.append(content['xgyr'][i])
                    new_row.append(content['ygyr'][i])
                    new_row.append(content['zgyr'][i])
                    new_row.append(content['name'])
                    new_row.append(id)
                    new_data.append(new_row)
        f_csv.writerow(headers)
        f_csv.writerows(new_data)

# 保存转换后的csv数据
saveData("standing",0)
saveData("expand",1)
saveData("squat",2)
saveData("russian_twist",3)
saveData("walk",4)
saveData("situp",5)
# 注意：保存后的六个csv文件需要手动合为一个csv文件（这里不做整合是因为手动合并比写代码快），然后再进行滤波处理





