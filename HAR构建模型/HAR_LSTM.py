import numpy as np
import pandas as pd
import os
import tensorflow.keras as keras
import tensorflow.keras.layers as layers
import random
import tensorflowjs as tfjs

# 参数设置
path = "./train_data" # all_data.csv文件所在的位置
learning_rate = 0.001
BATCH_SIZE = 32
EPOCH = 50
sample_rate = 0.7 # 我这里是通过分层抽样将数据集七三分成训练集和测试集，0.7代表选择70%的数据作为训练集

def read_file(filename):
    file = pd.read_csv(filename,header=None)
    df = pd.DataFrame(file)
    data = df.values
    return data

def load_files(path):
    dirs = os.listdir(path)
    i = 0
    loaded = list()
    for file in dirs:
        data = read_file(path+'/'+file)
        if i == 0:
            classes = data[:,-1]
            i += 1
        loaded.append(data[:,:len(data[0])-1])
    loaded = np.dstack(loaded)
    return loaded,classes


# 读取文件
print("Loading files...")
x,y = load_files(path)

# 分层抽样，分为训练集和测试集
print("Sampling...")
random_group = [[],[],[],[],[]]
for i in range(len(y)):
    random_group[int(y[i])].append(i)

for i in range(len(random_group)):
    random_group[i] = np.array(random_group[i])
random_group = np.array(random_group)

sample_list = list()
for i in range(len(random_group)):
    length = len(random_group[i])
    sample_num = int(sample_rate*length)
    random_list = random.sample(list(random_group[i]),sample_num)
    # print(random_list)
    for value in random_list:
        sample_list.append(value)

sample_list = sorted(sample_list)
all_list = [i for i in range(len(y))]
test_list = list(set(all_list).difference(set(sample_list)))
test_list = sorted(test_list)

train_x = x[sample_list]
train_y = y[sample_list]
test_x = x[test_list]
test_y = y[test_list]
train_y = keras.utils.to_categorical(train_y)
test_y = keras.utils.to_categorical(test_y)

# 模型构建
model = keras.Sequential()
model.add(layers.Dense(18,input_shape=(128,6,),activation='tanh'))
model.add(layers.LSTM(18,activation='tanh', recurrent_activation='sigmoid',dropout=0.2,return_sequences=True))
model.add(layers.LSTM(18,activation='tanh', recurrent_activation='sigmoid',dropout=0.2))
model.add(layers.Dense(5, activation='softmax'))


# 训练
print("Training...")
model.compile(optimizer=keras.optimizers.RMSprop(lr=learning_rate),
             loss=keras.losses.CategoricalCrossentropy(),  # 需要使用to_categorical
              metrics=['acc'])
history = model.fit(train_x, train_y, batch_size=BATCH_SIZE,epochs=EPOCH)
model.summary()

# 模型评估
print("Evaluating...")
result = model.evaluate(test_x, test_y)
predict = model.predict(test_x)
print(model.metrics_names)
print(result)

# 保存模型
print("Saving the model...")
# model.save('HAR_model_LSTM.h5') #如果你想保存keras模型，用这个
tfjs.converters.save_keras_model(model, './new_model')
print("OK!")