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

const QRCodeScanner = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [inputError, setInputError] = useState(false);
  const [qrCodeBorderColor, setQRCodeBorderColor] = useState("white");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned) return;

    setScanned(true);

    try {
      const result = await verificationURL(data);

      if (result === true) {
        navigate(`ObjectDetection?url=${data}`);
      } else {
        setInputError(true);
        setQRCodeBorderColor("red");
        setTimeout(() => {
          setQRCodeBorderColor("white");
          setScanned(false); // Allow scanning again after a delay
        }, 2000); // Adjust the delay as needed (in milliseconds)
      }
    } catch (error) {
      console.error("Error during QR code verification:", error);
      setInputError(true);
      setQRCodeBorderColor("red");
      setTimeout(() => {
        setQRCodeBorderColor("white");
        setScanned(false); // Allow scanning again after a delay
      }, 2000); // Adjust the delay as needed (in milliseconds)
    }
  };

  const handleUrlSubmit = async () => {
    try {
      if (manualUrl.trim() !== "") {
        const result = await verificationURL(manualUrl);
        if (result === true) {
          navigate(`ObjectDetection?url=${manualUrl}`);
        } else {
          setInputError(true);
        }
      } else {
        setInputError(true);
      }
    } catch (error) {
      console.error("Error during URL verification:", error);
      setInputError(true);
    }
  };

  const verificationURL = async (url) => {
    try {
      const response = await axios.get(`${url}/verification`);
      return response.data === "True";
    } catch (error) {
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
