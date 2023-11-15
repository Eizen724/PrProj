import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from "react-native";
import { Camera } from "expo-camera";
import axios from "axios";
import { useSearchParams } from "react-router-native";

const ObjectDetectionScreen = () => {
  const [cameraRef, setCameraRef] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [searchParams] = useSearchParams();
  const ApiUrl = searchParams.get("url");
  const detectionInterval = 5000;
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const takePicture = async () => {
    if (isCameraReady && cameraRef && hasPermission) {
      try {
        const options = { quality: 0.5, base64: true };
        const { uri } = await cameraRef.takePictureAsync(options);

        const formData = new FormData();
        formData.append("image", {
          uri,
          name: "image.jpg",
          type: "image/jpeg",
        });

        try {
          const response = await axios.post(`${ApiUrl}/detect`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          const detectedObjects = response.data.image_with_objects;
          setDetectedObjects(detectedObjects);
        } catch (error) {
          console.error("Error sending frame for detection:", error);
        }
      } catch (error) {
        console.error("Error taking picture:", error);
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

  const saveToGallery = async () => {
  
  };

  return (
    <View style={styles.container}>
      <View style={styles.detectedObjects}>
        <Image
          source={{ uri: `data:image/jpeg;base64, ${detectedObjects}` }}
          style={{
            height: Dimensions.get("window").height,
            width: Dimensions.get("window").width,
          }}
        />
      </View>

      {hasPermission === null ? (
        <Text>Requesting camera permission...</Text>
      ) : hasPermission === false ? (
        <Text>No access to the camera</Text>
      ) : (
        <View style={styles.cameraContainer}>
          <Camera
            style={styles.camera}
            type={Camera.Constants.Type.back}
            ref={(ref) => setCameraRef(ref)}
            onCameraReady={handleCameraReady}
          />
          <TouchableOpacity style={styles.captureButton} onPress={saveToGallery}>
            <Text style={styles.captureButtonText}>Capture & Save</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: "50%",
    height: "50%",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "slateblue",
    borderRadius: 6,
    zIndex: 1
  },
  camera: {
    flex: 1,
  },
  detectedObjects: {
    // position: "relative",
    // zIndex: 0
  },
  objectLabel: {
    fontSize: 18,
    marginBottom: 5,
  },
  cptText: {
    position: "absolute",
    top: 20,
    right: 20,
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff", 
  },
  captureButton: {
    position: "absolute",
    bottom: 20,
    left: 20, 
    backgroundColor: "#3498db", 
    padding: 15,
    borderRadius: 10,
  },
  captureButtonText: {
    color: "#fff", 
    fontSize: 16,
  },
});

export default ObjectDetectionScreen;
