import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Upload, CheckCircle, Clock, XCircle,
  CreditCard, BookOpen, ChevronDown, ChevronUp
} from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import { CTAButton } from '@/components/CTAButton';
import { SafeAreaView } from 'react-native-safe-area-context';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function VerificationScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [documentType, setDocumentType] = useState<'ID_CARD' | 'PASSPORT'>('ID_CARD');
  const [documentFront, setDocumentFront] = useState<any>(null);
  const [documentBack, setDocumentBack] = useState<any>(null);
  const [selfieImage, setSelfieImage] = useState<any>(null);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const res = await fetch(`${BASE_URL}/verification/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setVerification(data.data.verification);
    } catch (err) {
      console.error('Failed to fetch verification:', err);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (setter: (img: any) => void) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setter(result.assets[0]);
  };

  const takePhoto = async (setter: (img: any) => void) => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to your camera.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setter(result.assets[0]);
  };

  const handleImagePick = (setter: (img: any) => void) => {
    Alert.alert('Upload Image', 'Choose how you want to upload', [
      { text: 'Camera', onPress: () => takePhoto(setter) },
      { text: 'Gallery', onPress: () => pickImage(setter) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSubmit = async () => {
    if (!documentFront || !documentBack || !selfieImage) {
      Alert.alert('Error', 'Please upload all required documents.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('document_type', documentType);
      formData.append('document_front', {
        uri: documentFront.uri,
        name: 'document_front.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('document_back', {
        uri: documentBack.uri,
        name: 'document_back.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('selfie_image', {
        uri: selfieImage.uri,
        name: 'selfie.jpg',
        type: 'image/jpeg',
      } as any);

      const res = await fetch(`${BASE_URL}/verification/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert('Error', data.message || 'Failed to submit verification.');
        return;
      }

      Alert.alert(
        'Submitted!',
        'Your verification documents have been submitted. We will review them shortly.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = () => {
    if (!verification) return '#EF4444';
    switch (verification.status) {
      case 'APPROVED': return '#10B981';
      case 'PENDING': return '#F59E0B';
      case 'REJECTED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = () => {
    switch (verification?.status) {
      case 'APPROVED': return <CheckCircle size={64} color="#10B981" />;
      case 'PENDING': return <Clock size={64} color="#F59E0B" />;
      case 'REJECTED': return <XCircle size={64} color="#EF4444" />;
      default: return null;
    }
  };

  const getStatusMessage = () => {
    switch (verification?.status) {
      case 'APPROVED': return 'Your identity has been verified successfully. You now have full access to RentIt.';
      case 'PENDING': return 'Your documents are under review. This usually takes 1-2 business days.';
      case 'REJECTED': return 'Your verification was rejected. Please resubmit with clear, valid documents.';
      default: return '';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0F1C2E" />
        </View>
      </SafeAreaView>
    );
  }

  // Status screen
  if (verification && verification.status !== 'REJECTED') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={22} color="#0F1C2E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Identity Verification</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.statusScreen}>
            {getStatusIcon()}
            <Text style={[styles.statusTitle, { color: getStatusColor() }]}>
              {verification.status === 'APPROVED' ? 'Verified!' : 'Under Review'}
            </Text>
            <Text style={styles.statusMessage}>{getStatusMessage()}</Text>

            <View style={styles.submittedDocs}>
              <Text style={styles.submittedDocsTitle}>Submitted Documents</Text>
              <View style={styles.submittedDocsRow}>
                <View style={styles.submittedDocItem}>
                  <Image source={{ uri: verification.document_front }} style={styles.submittedDocImage} />
                  <Text style={styles.submittedDocLabel}>Front</Text>
                </View>
                <View style={styles.submittedDocItem}>
                  <Image source={{ uri: verification.document_back }} style={styles.submittedDocImage} />
                  <Text style={styles.submittedDocLabel}>Back</Text>
                </View>
                <View style={styles.submittedDocItem}>
                  <Image source={{ uri: verification.selfie_image }} style={styles.submittedDocImage} />
                  <Text style={styles.submittedDocLabel}>Selfie</Text>
                </View>
              </View>
            </View>

            <View style={styles.submittedInfo}>
              <View style={styles.submittedInfoRow}>
                <Text style={styles.submittedInfoLabel}>Document Type</Text>
                <Text style={styles.submittedInfoValue}>{verification.document_type}</Text>
              </View>
              <View style={styles.submittedInfoRow}>
                <Text style={styles.submittedInfoLabel}>Submitted</Text>
                <Text style={styles.submittedInfoValue}>
                  {new Date(verification.submitted_at).toDateString()}
                </Text>
              </View>
              {verification.reviewed_at && (
                <View style={styles.submittedInfoRow}>
                  <Text style={styles.submittedInfoLabel}>Reviewed</Text>
                  <Text style={styles.submittedInfoValue}>
                    {new Date(verification.reviewed_at).toDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Submission form
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={22} color="#0F1C2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Identity Verification</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={20} color="#2F80ED" />
          <Text style={styles.infoBannerText}>
            We need to verify your identity to keep RentIt safe for everyone. Your documents are encrypted and stored securely.
          </Text>
        </View>

        {/* Rejected banner */}
        {verification?.status === 'REJECTED' && (
          <View style={styles.rejectedBanner}>
            <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
            <Text style={styles.rejectedBannerText}>
              Your previous verification was rejected. Please resubmit with clear, valid documents.
            </Text>
          </View>
        )}

        {/* Document Type */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Document Type</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, documentType === 'ID_CARD' && styles.toggleActive]}
              onPress={() => setDocumentType('ID_CARD')}>
              <CreditCard
                size={16}
                color={documentType === 'ID_CARD' ? '#FFFFFF' : '#6B7280'}
                strokeWidth={2}
              />
              <Text style={documentType === 'ID_CARD' ? styles.toggleTextActive : styles.toggleText}>
                ID Card
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, documentType === 'PASSPORT' && styles.toggleActive]}
              onPress={() => setDocumentType('PASSPORT')}>
              <BookOpen
                size={16}
                color={documentType === 'PASSPORT' ? '#FFFFFF' : '#6B7280'}
                strokeWidth={2}
              />
              <Text style={documentType === 'PASSPORT' ? styles.toggleTextActive : styles.toggleText}>
                Passport
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Document Front */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="id-card-outline" size={18} color="#0F1C2E" />
            <Text style={styles.cardLabel}>
              {documentType === 'ID_CARD' ? 'ID Card Front' : 'Passport Photo Page'}
            </Text>
          </View>
          <Text style={styles.cardSubLabel}>
            Take a clear photo of the front of your document
          </Text>
          <TouchableOpacity
            style={styles.uploadBox}
            onPress={() => handleImagePick(setDocumentFront)}
            activeOpacity={0.8}>
            {documentFront ? (
              <Image source={{ uri: documentFront.uri }} style={styles.uploadedImage} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Upload size={28} color="#9CA3AF" strokeWidth={1.5} />
                <Text style={styles.uploadText}>Tap to upload</Text>
              </View>
            )}
          </TouchableOpacity>
          {documentFront && (
            <TouchableOpacity onPress={() => setDocumentFront(null)} style={styles.removeButton}>
              <Ionicons name="trash-outline" size={14} color="#EF4444" />
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Document Back */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="id-card-outline" size={18} color="#0F1C2E" />
            <Text style={styles.cardLabel}>
              {documentType === 'ID_CARD' ? 'ID Card Back' : 'Passport Back Page'}
            </Text>
          </View>
          <Text style={styles.cardSubLabel}>
            Take a clear photo of the back of your document
          </Text>
          <TouchableOpacity
            style={styles.uploadBox}
            onPress={() => handleImagePick(setDocumentBack)}
            activeOpacity={0.8}>
            {documentBack ? (
              <Image source={{ uri: documentBack.uri }} style={styles.uploadedImage} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Upload size={28} color="#9CA3AF" strokeWidth={1.5} />
                <Text style={styles.uploadText}>Tap to upload</Text>
              </View>
            )}
          </TouchableOpacity>
          {documentBack && (
            <TouchableOpacity onPress={() => setDocumentBack(null)} style={styles.removeButton}>
              <Ionicons name="trash-outline" size={14} color="#EF4444" />
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Selfie */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="camera-outline" size={18} color="#0F1C2E" />
            <Text style={styles.cardLabel}>Selfie with Document</Text>
          </View>
          <Text style={styles.cardSubLabel}>
            Take a selfie while holding your document next to your face
          </Text>
          <TouchableOpacity
            style={styles.uploadBox}
            onPress={() => handleImagePick(setSelfieImage)}
            activeOpacity={0.8}>
            {selfieImage ? (
              <Image source={{ uri: selfieImage.uri }} style={styles.uploadedImage} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Ionicons name="camera-outline" size={28} color="#9CA3AF" />
                <Text style={styles.uploadText}>Tap to take selfie</Text>
              </View>
            )}
          </TouchableOpacity>
          {selfieImage && (
            <TouchableOpacity onPress={() => setSelfieImage(null)} style={styles.removeButton}>
              <Ionicons name="trash-outline" size={14} color="#EF4444" />
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="bulb-outline" size={18} color="#0F1C2E" />
            <Text style={styles.tipsTitle}>Tips for a successful verification</Text>
          </View>
          {[
            'Make sure documents are not expired',
            'Ensure all text is clearly readable',
            'Avoid glare or shadows on documents',
            'Selfie must clearly show your face and document',
          ].map((tip, index) => (
            <View key={index} style={styles.tipRow}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <CTAButton
          title={submitting ? 'Submitting...' : 'Submit Verification'}
          onPress={submitting ? undefined : handleSubmit}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
    paddingTop: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F5F6F8',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F1C2E',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusScreen: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  statusTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginTop: 16,
    marginBottom: 12,
  },
  statusMessage: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  submittedDocs: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  submittedDocsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#0F1C2E',
    marginBottom: 12,
  },
  submittedDocsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submittedDocItem: {
    alignItems: 'center',
    width: '30%',
  },
  submittedDocImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 6,
  },
  submittedDocLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  submittedInfo: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  submittedInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  submittedInfoLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  submittedInfoValue: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#0F1C2E',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EAF3FF',
    padding: 14,
    borderRadius: 12,
    gap: 10,
    marginBottom: 16,
  },
  infoBannerText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#2F80ED',
    flex: 1,
    lineHeight: 20,
  },
  rejectedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 12,
    gap: 10,
    marginBottom: 16,
  },
  rejectedBannerText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    flex: 1,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#0F1C2E',
  },
  cardSubLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  toggleBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  toggleActive: {
    backgroundColor: '#0F1C2E',
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  toggleTextActive: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  uploadBox: {
    height: 160,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    marginTop: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  removeButtonText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#0F1C2E',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  tipText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    flex: 1,
  },
});