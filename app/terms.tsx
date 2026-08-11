import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// PLACEHOLDER CONTENT — this is structural scaffolding only, not legal advice.
// Have a lawyer familiar with Cameroonian consumer/e-commerce law review and
// finalize this before RentIt goes live, especially the payments, deposits,
// liability, and dispute sections, since real money changes hands on this platform.
const LAST_UPDATED = 'August 2026';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body:
      'By creating a RentIt account, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the app.',
  },
  {
    title: '2. What RentIt Is',
    body:
      'RentIt is a platform that connects people who want to rent out items ("Owners") with people who want to rent them ("Renters"). RentIt does not own, inspect, or guarantee the condition of any listed item. Listings are created by our team on behalf of Owners after a request is reviewed.',
  },
  {
    title: '3. Accounts',
    body:
      'You must provide accurate information when registering, including a working phone number if you intend to pay for or receive payments for rentals. You are responsible for keeping your login credentials secure.',
  },
  {
    title: '4. Identity Verification',
    body:
      'Certain items require identity verification (KYC) before they can be rented. Submitted documents are used solely to confirm your identity and are handled according to our Privacy Policy.',
  },
  {
    title: '5. Payments',
    body:
      'Rental and deposit payments are processed via Mobile Money through our third-party payment processor. RentIt does not store your Mobile Money PIN or full financial account details. All prices are shown in CFA Francs (XAF).',
  },
  {
    title: '6. Security Deposits',
    body:
      'Some items require a refundable security deposit, shown before you request a rental. Deposit refunds are processed manually after the item is returned in the condition it was rented in. RentIt reserves the right to withhold all or part of a deposit in the case of damage, loss, or late return, at its reasonable discretion.',
  },
  {
    title: '7. Cancellations',
    body:
      'Rental requests may be cancelled free of charge within 20 minutes of being submitted. After this window, cancellations must be requested through support and are handled on a case-by-case basis.',
  },
  {
    title: '8. Owner & Renter Conduct',
    body:
      'Owners and Renters are expected to coordinate pickup, delivery, and item condition in good faith. RentIt is not a party to the rental agreement between Owner and Renter and is not responsible for disputes arising from item condition, late returns, or damage, though we may assist in mediating disputes where possible.',
  },
  {
    title: '9. Loss and Theft',
    body:
      'RentIt is not responsible for the loss, theft, or disappearance of any item while it is in a Renters possession, or for any item entrusted to a Renter or Owner during pickup, delivery, or the rental period. Owners list items at their own risk, and Renters are fully responsible for the safekeeping and return of any item they rent. A security deposit, where required, is not a guarantee of full replacement value and does not limit an Owners right to pursue a Renter directly for losses exceeding the deposit amount. Any suspected theft should be reported to RentIt support and, where appropriate, to local law enforcement; RentIt may suspend or terminate the account of any user found to have stolen or misappropriated a rented item, but assumes no financial liability for the loss itself.',
  },
  {
    title: '10. Prohibited Use',
    body:
      'You may not use RentIt to list or rent illegal items, misrepresent your identity, or attempt to circumvent payments or deposits owed through the platform.',
  },
  {
    title: '11.Suspension & Termination',
    body:
      'RentIt reserves the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or pose a risk to other users.',
  },
  {
    title: '12. Limitation of Liability',
    body:
      'RentIt provides the platform on an "as is" basis and acts solely as a connector between Owners and Renters. To the maximum extent permitted by law, RentIt is not liable for the theft, loss, damage, or misappropriation of any item, nor for any indirect, incidental, or consequential damages arising from use of the platform or from rental transactions between users. RentIts total liability to any user, where liability cannot be excluded by law, is limited to the fees actually paid to RentIt by that user in the transaction giving rise to the claim.',
  },
  {
    title: '13. Changes to These Terms',
    body:
      'We may update these Terms and Conditions from time to time. Continued use of RentIt after changes are posted constitutes acceptance of the revised terms.',
  },
  {
    title: '14. Contact',
    body:
      'Questions about these terms can be sent to our support team via the WhatsApp contact option in your profile.',
  },
];


export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={22} color="#0F1C2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Last updated: {LAST_UPDATED}</Text>

          {SECTIONS.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionBody}>{section.body}</Text>
            </View>
          ))}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
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
  },
  content: {
    paddingHorizontal: 20,
  },
  lastUpdated: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: '#0F1C2E',
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 21,
  },
});