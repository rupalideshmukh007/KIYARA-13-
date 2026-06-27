
import React, { useState, useEffect } from 'react';
import { View, Modal, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KNOWLEDGE_KEY = 'kiyara_knowledge_hub';

export interface KnowledgeItem {
  id: string;
  type: 'form' | 'study';
  title: string;
  content: string;
}

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string, content: string) => void;
  activeMode: 'form' | 'study';
}

const AddItemModal: React.FC<AddItemModalProps> = ({ visible, onClose, onSave, activeMode }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSave = () => {
        if (title && content) {
            onSave(title, content);
            setTitle('');
            setContent('');
        } else {
            Alert.alert("त्रुटी", "कृपया विषय आणि माहिती दोन्ही भरा.");
        }
    };

    return (
        <Modal visible={visible} onRequestClose={onClose} animationType="slide">
            <View style={styles.addItemContainer}>
                <Text style={styles.addTitle}>नवीन {activeMode === 'form' ? 'फॉर्म' : 'अभ्यास'} जोडा</Text>
                <TextInput
                    style={styles.input}
                    placeholder="विषय (Title)"
                    placeholderTextColor="#888"
                    value={title}
                    onChangeText={setTitle}
                />
                <TextInput
                    style={styles.textarea}
                    placeholder={activeMode === 'form' ? 'फॉर्म भरण्याच्या पायऱ्या (Steps)...' : 'अभ्यासाची माहिती...'}
                    placeholderTextColor="#888"
                    value={content}
                    onChangeText={setContent}
                    multiline
                />
                <View style={styles.addModalButtonContainer}>
                    <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                        <Text style={styles.buttonText}>सेव्ह करा</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={onClose}>
                        <Text style={styles.buttonText}>बंद करा</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};


interface KnowledgeHubProps {
  visible: boolean;
  onClose: () => void;
  onSelectItem: (item: KnowledgeItem) => void;
}

const KnowledgeHub: React.FC<KnowledgeHubProps> = ({ visible, onClose, onSelectItem }) => {
  const [activeMode, setActiveMode] = useState<'form' | 'study'>('form');
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [isAddModalVisible, setAddModalVisible] = useState(false);

  const loadItems = async () => {
    try {
      const storedItems = await AsyncStorage.getItem(KNOWLEDGE_KEY);
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
    } catch (e) {
        console.error("Failed to load knowledge items.", e);
    }
  };

  useEffect(() => {
    if (visible) {
      loadItems();
    }
  }, [visible]);

  const saveItems = async (newItems: KnowledgeItem[]) => {
    try {
      await AsyncStorage.setItem(KNOWLEDGE_KEY, JSON.stringify(newItems));
      setItems(newItems);
    } catch (e) {
        console.error("Failed to save knowledge items.", e);
    }
  }

  const handleAddItem = (title: string, content: string) => {
    if (activeMode === 'form' && items.filter(i => i.type === 'form').length >= 20) {
        Alert.alert(' मर्यादा पूर्ण', 'फॉर्म मोडमध्ये तुम्ही कमाल २० फॉर्म सेव्ह करू शकता.');
        return;
    }
    const newItem: KnowledgeItem = {
      id: Date.now().toString(),
      type: activeMode,
      title,
      content,
    };
    const updatedItems = [...items, newItem];
    saveItems(updatedItems);
    setAddModalVisible(false);
  };
  
  const handleDeleteItem = (id: string) => {
      Alert.alert(
          'खात्री करा',
          'तुम्हाला ही माहिती कायमची काढून टाकायची आहे का?',
          [
              { text: 'नाही', style: 'cancel' },
              { text: 'हो', onPress: () => {
                  const updatedItems = items.filter(item => item.id !== id);
                  saveItems(updatedItems);
              }, style: 'destructive' },
          ]
      );
  }

  const renderItem = ({ item }: { item: KnowledgeItem }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => onSelectItem(item)}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <TouchableOpacity style={styles.deleteIcon} onPress={(e) => {e.stopPropagation(); handleDeleteItem(item.id)}}>
          <Text style={styles.deleteButton}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>🧠 नॉलेज हब 🧠</Text>
            <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                <Text style={{fontSize: 24, color: '#333'}}>❌</Text>
            </TouchableOpacity>
        </View>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeMode === 'form' && styles.activeTab]} 
            onPress={() => setActiveMode('form')}>
            <Text style={styles.tabText}>📝 फॉर्म मोड</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeMode === 'study' && styles.activeTab]} 
            onPress={() => setActiveMode('study')}>
            <Text style={styles.tabText}>📚 अभ्यास मोड</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={items.filter(item => item.type === activeMode)}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>इथे कोणतीही माहिती सेव्ह केलेली नाही.</Text>}
          contentContainerStyle={{paddingBottom: 100}} 
        />

        <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
            <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>

        <AddItemModal 
            visible={isAddModalVisible}
            onClose={() => setAddModalVisible(false)}
            onSave={handleAddItem}
            activeMode={activeMode}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDF5E6', 
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#F5DEB3', 
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#D2B48C'
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#8B4513',
    },
    closeIcon: {
        padding: 5,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#FAEBD7',
    },
    tab: {
        paddingVertical: 15,
        flex: 1,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent'
    },
    activeTab: {
        borderBottomColor: '#8B4513',
    },
    tabText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#A0522D',
    },
    itemContainer: {
        backgroundColor: '#fff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    itemTitle: {
        fontSize: 18,
        color: '#000',
        flex: 1
    },
    deleteIcon: {
        paddingLeft: 15,
    },
    deleteButton: {
        fontSize: 24,
    },
    addButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#A0522D',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
    },
    addButtonText: {
        fontSize: 30,
        color: 'white',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#555',
    },
    addItemContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#FDF5E6',
        paddingTop: 60,
    },
    addTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#8B4513',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        marginBottom: 20,
        borderColor: '#D2B48C',
        borderWidth: 1,
        color: '#000'
    },
    textarea: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        height: 350,
        textAlignVertical: 'top',
        borderColor: '#D2B48C',
        borderWidth: 1,
        color: '#000'
    },
    addModalButtonContainer: {
        flexDirection: 'row',
        marginTop: 20,
        justifyContent: 'space-around',
    },
    button: {
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
        elevation: 2,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
      },
    saveButton: {
        backgroundColor: '#2E8B57', 
    },
    closeButton: {
        backgroundColor: '#CD5C5C', 
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default KnowledgeHub;
