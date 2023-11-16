import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Linking,
  StyleSheet,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { useNavigate } from "react-router-native";
import axios from "axios";

/**
 * QRCodeScanner component.
 * 
 * This component allows the user to scan a QR code and enter a URL manually.
 * It verifies the scanned QR code or manually entered URL and navigates to the ObjectDetection page if the verification is successful.
 * If the verification fails, it displays an input error and resets the scanning process.
 */
const QRCodeScanner = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [inputError, setInputError] = useState(false);
  const [qrCodeBorderColor, setQRCodeBorderColor] = useState("white");
  const navigate = useNavigate();

  /**
   * Request camera permission on component mount.
   */
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

/**
 * Handles the event when a barcode is scanned.
 * 
 * @param {Object} barcode - The barcode object containing type and data.
 */
const handleBarCodeScanned = async (barcode) => {
  // Return early if already scanned
  if (scanned) return;

  setScanned(true);

  try {
    const result = await verificationURL(barcode.data);

    // If verification is successful, navigate to ObjectDetection screen
    if (result === true) {
      navigate(`ObjectDetection?url=${barcode.data}`);
    } else {
      // Set input error and border color to red
      setInputError(true);
      setQRCodeBorderColor("red");

      // Reset input error and border color after 2 seconds
      setTimeout(() => {
        setQRCodeBorderColor("white");
        setScanned(false);
      }, 2000);
    }
  } catch (error) {
    console.error("Error during QR code verification:", error);
    
    // Set input error and border color to red
    setInputError(true);
    setQRCodeBorderColor("red");

    // Reset input error and border color after 2 seconds
    setTimeout(() => {
      setQRCodeBorderColor("white");
      setScanned(false);
    }, 2000);
  }
};

/**
 * Handles the submission of a URL.
 * If the URL is valid, navigates to the ObjectDetection page.
 * If the URL is invalid, sets the input error flag.
 * @param {string} manualUrl - The manually entered URL.
 */
const handleUrlSubmit = async (manualUrl) => {
  try {
    // Check if the manualUrl is not empty or only whitespace
    if (manualUrl.trim() !== "") {
      // Verify the URL
      const result = await verificationURL(manualUrl);
      // If the URL is valid, navigate to the ObjectDetection page
      if (result === true) {
        navigate(`ObjectDetection?url=${manualUrl}`);
      } else {
        // Set the input error flag if the URL is invalid
        setInputError(true);
      }
    } else {
      // Set the input error flag if the manualUrl is empty or only whitespace
      setInputError(true);
    }
  } catch (error) {
    // Log the error and set the input error flag
    console.error("Error during URL verification:", error);
    setInputError(true);
  }
};

/**
 * Verifies if a given URL is valid by sending a GET request to the verification endpoint.
 * @param {string} url - The URL to be verified.
 * @returns {Promise<boolean>} - A promise that resolves to true if the URL is valid, false otherwise.
 */
const verificationURL = async (url) => {
  try {
    // Send a GET request to the verification endpoint
    const response = await axios.get(`${url}/verification`);
    // Check if the response data is "True"
    return response.data === "True";
  } catch (error) {
    // Return false if there was an error during the request
    return false;
  }
};

  if (hasPermission === null) {
    return <Text style={styles.text}>Requesting camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text style={styles.text}>No access to camera</Text>;
  }

  const handleExternalLink = () => {
    Linking.openURL(
      "https://colab.research.google.com/github/Eizen724/PrProj/blob/main/PR_PROJ.ipynb"
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, inputError && styles.inputError]}
        placeholder="Enter URL manually"
        placeholderTextColor="gray"
        onChangeText={(text) => {
          setManualUrl(text);
          setInputError(false);
        }}
        onSubmitEditing={handleUrlSubmit}
        value={manualUrl}
      />
      <View style={styles.cameraContainer}>
        <View style={[styles.square, { borderColor: qrCodeBorderColor }]}>
          <BarCodeScanner
            onBarCodeScanned={handleBarCodeScanned}
            style={{ flex: 1 }}
          />
        </View>
      </View>
      <Text style={styles.text}>
        Scan Your object detection QR code. You can get a QR code by
        clicking&nbsp;
        <TouchableOpacity onPress={handleExternalLink}>
          <Text style={styles.linkText}>here</Text>
        </TouchableOpacity>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  linkText: {
    color: "blue",
    textDecorationLine: "underline",
    fontSize: 24,
  },
  cameraContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    aspectRatio: 1,
  },
  square: {
    width: "80%",
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: "white",
    overflow: "hidden",
  },
  input: {
    marginTop: "20%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    color: "white",
    margin: 20,
    paddingHorizontal: 10,
  },
  inputError: {
    borderColor: "red",
  },
});

export default QRCodeScanner;
