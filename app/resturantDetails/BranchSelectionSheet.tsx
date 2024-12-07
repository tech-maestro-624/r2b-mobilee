// BranchSelectionSheet.tsx

import React from 'react';
import { ScrollView, Text, Pressable } from 'react-native';
import { Sheet, YStack, XStack } from 'tamagui';
import { AntDesign } from '@expo/vector-icons';

// Interfaces
interface Branch {
  _id: string;
  name: string;
}

interface BranchSelectionSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  branches: Branch[];
  selectedBranch: Branch | null;
  setSelectedBranch: React.Dispatch<React.SetStateAction<Branch | null>>;
  colors: { [key: string]: string };
}

const BranchSelectionSheet: React.FC<BranchSelectionSheetProps> = ({
  isOpen,
  onOpenChange,
  branches,
  selectedBranch,
  setSelectedBranch,
  colors,
}) => {
  return (
    <Sheet
      open={isOpen}
      onOpenChange={onOpenChange}
      snapPoints={[80]}
      position={0}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
      <Sheet.Frame
        style={{
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <Sheet.Handle
          style={{
            backgroundColor: colors.primary,
            width: 40,
            height: 5,
            borderRadius: 3,
          }}
        />
        <ScrollView>
          <YStack padding={16} space={16}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
              Select a Branch
            </Text>
            {branches.map((branch) => (
              <Pressable
                key={branch._id}
                onPress={() => {
                  setSelectedBranch(branch);
                  onOpenChange(false);
                }}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor:
                    selectedBranch?._id === branch._id ? colors.selectedBackground : 'transparent',
                  borderColor: colors.border,
                  borderWidth: 1,
                  marginBottom: 8,
                }}
              >
                <XStack justifyContent="space-between" alignItems="center">
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: selectedBranch?._id === branch._id ? '700' : '400',
                      color: colors.text,
                    }}
                  >
                    {branch.name}
                  </Text>
                  {selectedBranch?._id === branch._id && (
                    <AntDesign name="checkcircle" size={24} color={colors.primary} />
                  )}
                </XStack>
              </Pressable>
            ))}
          </YStack>
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
};

export default BranchSelectionSheet;
