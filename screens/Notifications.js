import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");

const NotificationScreen = ({ notifications = [], visible, onClose }) => {
  // Check if notifications is an array and log an error if it's not
  if (!Array.isArray(notifications)) {
    console.error("Notifications should be an array.");
    return null; // Return null if notifications is not an array
  }

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notifications</Text>
          </View>

          {notifications.length === 0 ? (
            <Text style={styles.modalContent}>No new notifications.</Text>
          ) : (
            <View style={styles.notificationsList}>
              {notifications.map((notification) => (
                <View
                  key={notification.id}
                  style={styles.notificationItemContainer}
                >
                  <Text style={styles.notificationTitle}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationMessage}>
                    {notification.message}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContainer: {
    backgroundColor: "#9090ff",
    borderRadius: 20,
    paddingBottom: height * 0.02,
    width: width * 0.85,
    height: height * 0.6,
    justifyContent: "space-between",
    borderWidth: 2,
    borderBottomColor: "white",
    borderRightColor: "white",
    borderLeftColor: "white",
    alignItems: "center",
  },
  modalHeader: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#635DC2",
    width: "100%",
    height: height * 0.08,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 100,
    borderBottomLeftRadius: 100,
    borderWidth: 2,
  },
  modalTitle: {
    color: "white",
    fontFamily: "LilitaOne_400Regular",
    fontSize: width * 0.05,
    textAlign: "center",
    textShadowColor: "black",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalContent: {
    fontSize: width * 0.05,
    color: "#fff",
    fontFamily: "LilitaOne_400Regular",
    textShadowColor: "black",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginTop: height * 0.02,
  },
  notificationsList: {
    marginBottom: height * 0.02,
    width: "90%",
  },
  notificationItemContainer: {
    marginBottom: height * 0.02,
    paddingBottom: height * 0.01,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: "100%",
  },
  notificationTitle: {
    fontSize: width * 0.045,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "black",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  notificationMessage: {
    fontSize: width * 0.04,
    color: "#ddd",
  },
  closeButton: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.1,
    backgroundColor: "red",
    borderRadius: 5,
    elevation: 3,
  },
  closeButtonText: {
    color: "white",
    fontFamily: "LilitaOne_400Regular",
    fontSize: width * 0.045,
    textAlign: "center",
    textShadowColor: "black",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default NotificationScreen;
