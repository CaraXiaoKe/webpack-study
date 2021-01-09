# webpack-study

### Node 端口被占用解决办法
ps -aux | grep node
`
ubuntu   26619  0.8  5.8 876916 110108 pts/0   Sl+  09:56   0:02 node /home/ubuntu/.nvm/versions/node/v12.20.0/bin/m-cli dev
ubuntu   27831  0.0  0.0  13748  1060 pts/1    S+   10:02   0:00 grep node

`
 kill -s 9 26619