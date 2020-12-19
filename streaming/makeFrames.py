import cv2
 
# Opens the Video file
cap= cv2.VideoCapture("C://Users//sharj//Documents//ActivePresenter//Untitled//Video//Untitled.mp4")
i=0
while(cap.isOpened()):
    ret, frame = cap.read()
    if ret == False:
        break

    if(i%40==0):
        cv2.imwrite('frames/fire'+str(i)+'.jpg',frame)

    i+=1
 
cap.release()
cv2.destroyAllWindows()