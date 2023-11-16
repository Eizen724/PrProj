import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from "react-native";
import { Camera } from "expo-camera";
import axios from "axios";
import { useSearchParams } from "react-router-native";

/**
 * ObjectDetectionScreen component.
 * This component displays a camera view and detects objects in the camera frames.
 */
const ObjectDetectionScreen = () => {
  // State variables
  const [cameraRef, setCameraRef] = useState(null); // Reference to the camera component
  const [hasPermission, setHasPermission] = useState(null); // Camera permission status
  const [detectedObjects, setDetectedObjects] = useState([]); // Array of detected objects
  const [isCameraReady, setIsCameraReady] = useState(false); // Flag indicating if the camera is ready
  const [searchParams] = useSearchParams(); // Search parameters
  const [cpt, setCpt] = useState(0); // Counter
  const ApiUrl = searchParams.get("url"); // API URL
  const detectionInterval = 5000; // Interval for taking pictures

  /**
   * Request camera permission when the component mounts.
   */
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

/**
 * Takes a picture using the camera and sends it for object detection.
 * @returns {Promise<void>} A Promise that resolves when the picture is taken and sent for detection.
 */
const takePicture = async () => {
  // Increment the counter
  setCpt(cpt + 1);

  // Check if the camera is ready, cameraRef is available, and hasPermission is granted
  if (isCameraReady && cameraRef && hasPermission) {
    try {
      // Set the options for the picture
      const options = { quality: 0.5, base64: true };

      // Take the picture using the cameraRef
      const { uri } = await cameraRef.takePictureAsync(options);

      // Create a FormData object and append the picture to it
      const formData = new FormData();
      formData.append("image", {
        uri,
        name: "image.jpg",
        type: "image/jpeg",
      });

      try {
        // Send the picture for detection using axios post request
        const response = await axios.post(`${ApiUrl}/detect`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Get the detected objects from the response and set them
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

  /**
   * Handle camera readiness and take a picture when the camera is ready.
   */
  const handleCameraReady = () => {
    setIsCameraReady(true);
    takePicture();
  };

  /**
   * Take pictures at regular intervals for object detection.
   */
  useEffect(() => {
    const intervalId = setInterval(() => {
      takePicture();
    }, detectionInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [isCameraReady, hasPermission]);

  /**
   * Render the ObjectDetectionScreen component.
   */
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
