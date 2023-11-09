import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { Camera } from 'expo-camera';
import axios from 'axios';
import { useSearchParams } from 'react-router-native';

const ObjectDetectionScreen = () => {
  const [cameraRef, setCameraRef] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [searchParams] = useSearchParams();
  const ApiUrl = searchParams.get("url");
  const detectionInterval = 5000; 
  const [cpt, setCpt] = useState(0);
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    setCpt(cpt + 1); 
    if (isCameraReady && cameraRef && hasPermission) {
      try {
        const options = { quality: 0.5, base64: true };
        const { uri } = await cameraRef.takePictureAsync(options);

        const formData = new FormData();
        formData.append('image', {
          uri,
          name: 'image.jpg',
          type: 'image/jpeg',
        });

        try {
          const response = await axios.post(
            `${ApiUrl}/detect`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          const detectedObjects = response.data.image_with_objects;
          setDetectedObjects(detectedObjects);
        } catch (error) {
          console.error('Error sending frame for detection:', error);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    }
  };

  const handleCameraReady = () => {
    setIsCameraReady(true);
    takePicture(); 
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      takePicture();
    }, detectionInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [isCameraReady, hasPermission]);

  return (
    <View style={styles.container}>
      {hasPermission === null ? (
        <Text>Requesting camera permission...</Text>
      ) : hasPermission === false ? (
        <Text>No access to the camera</Text>
      ) : (
        <View style={styles.cameraContainer}>
          <Text style={styles.cptText}>{cpt}</Text>
          <Camera
            style={styles.camera}
            type={Camera.Constants.Type.back}
            ref={(ref) => setCameraRef(ref)}
            onCameraReady={handleCameraReady}
          />
        </View>
      )}
      <View style={styles.detectedObjects}>
        <Image source={{ uri: `data:image/jpeg;base64, ${detectedObjects}` }} style={{ height: Dimensions.get('window').height, width: Dimensions.get('window').width, }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  detectedObjects: {
    position: 'absolute',
  },
  objectLabel: {
    fontSize: 18,
    marginBottom: 5,
  },
  cptText: {
    position: 'absolute',
    top: 20,
    right: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ObjectDetectionScreen;
