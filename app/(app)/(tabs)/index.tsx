import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Helper function to format PKR amounts
const formatPKR = (amount: number) => {
  return `PKR ${amount.toLocaleString('en-PK')}`;
};

export default function Dashboard() {
  const recentTransactions = [
    { id: 1, type: 'expense', description: 'Utility Bills', amount: -15000, date: '2024-01-20' },
    { id: 2, type: 'income', description: 'Salary', amount: 150000, date: '2024-01-19' },
    { id: 3, type: 'expense', description: 'Grocery Store', amount: -8500, date: '2024-01-18' },
    { id: 4, type: 'expense', description: 'Mobile Bill', amount: -2000, date: '2024-01-17' },
  ];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#1e3c72', '#2a5298']}
        style={styles.header}
      >
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>{formatPKR(1245890)}</Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="send-outline" size={24} color="#fff" />
            <Text style={styles.actionText}>Send Money</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="card-outline" size={24} color="#fff" />
            <Text style={styles.actionText}>Bill Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="qr-code-outline" size={24} color="#fff" />
            <Text style={styles.actionText}>Scan QR</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.accountsSection}>
        <Text style={styles.sectionTitle}>My Accounts</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={styles.accountCard}>
            <Text style={styles.accountType}>Current Account</Text>
            <Text style={styles.accountNumber}>**** 4589</Text>
            <Text style={styles.accountBalance}>{formatPKR(845932)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.accountCard}>
            <Text style={styles.accountType}>Savings Account</Text>
            <Text style={styles.accountNumber}>**** 7823</Text>
            <Text style={styles.accountBalance}>{formatPKR(399958)}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.transactionsSection}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {recentTransactions.map(transaction => (
          <TouchableOpacity key={transaction.id} style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
              <Ionicons
                name={transaction.type === 'expense' ? 'arrow-down' : 'arrow-up'}
                size={20}
                color={transaction.type === 'expense' ? '#ff4757' : '#2ecc71'}
              />
            </View>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionDescription}>{transaction.description}</Text>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                { color: transaction.type === 'expense' ? '#ff4757' : '#2ecc71' }
              ]}
            >
              {formatPKR(Math.abs(transaction.amount))}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 12,
    width: 100,
  },
  actionText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  accountsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  accountCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginRight: 15,
    width: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  accountType: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 5,
  },
  accountNumber: {
    color: '#7f8c8d',
    marginBottom: 10,
  },
  accountBalance: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  transactionsSection: {
    padding: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 5,
  },
  transactionDate: {
    color: '#7f8c8d',
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});