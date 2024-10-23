/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Switch,
} from 'react-native';
import { connect } from 'react-redux';
import { t } from 'ttag';

import HathorHeader from '../components/HathorHeader';
import baseStyle from '../styles/init';
import {
  isBiometryEnabled, setBiometryEnabled, getSupportedBiometry, changePin, generateRandomPassword
} from '../utils';
import { HathorList, ListItem, ListMenu } from '../components/HathorList';
import { lockScreen } from '../actions';
import { COLORS } from '../styles/themes';

const mapStateToProps = (state) => ({
  wallet: state.wallet,
});

const mapDispatchToProps = (dispatch) => ({
  lockScreen: () => dispatch(lockScreen()),
});

export class Security extends React.Component {
  style = ({ ...baseStyle,
    ...StyleSheet.create({
      view: {
        padding: 16,
        justifyContent: 'space-between',
      },
      logo: {
        height: 30,
        width: 170,
      },
      logoView: {
        marginTop: 16,
        marginBottom: 16,
      },
    }) });

  constructor(props) {
    super(props);
    /**
     * supportedBiometry {str} Type of biometry supported
     */
    this.supportedBiometry = getSupportedBiometry();

    /**
     * biometryEnabled {boolean} If user enabled biometry. If no biometry support, always false
     */
    this.state = {
      biometryEnabled: this.supportedBiometry && isBiometryEnabled(),
    };
  }

  onBiometrySwitchChange = (value) => {
    if (value) {
      this.onBiometryEnabled();
    } else {
      this.onBiometryDisabled();
    }
  }

  executeBiometryEnable = (pin) => {
    const password = generateRandomPassword();
    changePin(
      this.props.wallet,
      pin,
      password,
    ).then((success) => {
      if (success)
      {
        setBiometryEnabled(true);
        this.setState({ biometryEnabled: true });
      } else {
        // Should never get here because we've done all the validations before
        // XXX: prepare error message?
      }
    });
  }

  executeBiometryDisable = (password) => {
    changePin(
      this.props.wallet,
      password,
      '000001',
    ).then((success) => {
      if (success)
      {
        setBiometryEnabled(false);
        this.setState({ biometryEnabled: false });
      } else {
        // Should never get here because we've done all the validations before
        // XXX: prepare error message?
      }
    });
  }

  onBiometryDisabled = () => {
    const params = {
      cb: this.executeBiometryDisable,
      canCancel: true,
      screenText: t`Enter your 6-digit pin to disable biometry`,
      biometryText: t`Disable biometry`,`
    };
    this.props.navigation.navigate('PinScreen', params);
  }

  /**
   * Executed when user clicks to enable the biometry
   */
  onBiometryEnabled = () => {
    const params = {
      cb: this.executeBiometryEnable,
      canCancel: true,
      screenText: t`Enter your 6-digit pin to enable biometry`,
    };
    this.props.navigation.navigate('PinScreen', params);
  }

  onLockWallet = () => {
    this.props.lockScreen();
  }

  render() {
    const switchDisabled = !this.supportedBiometry;
    const biometryText = (switchDisabled ? t`No biometry supported` : t`Use ${this.supportedBiometry}`);
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.lowContrastDetail }}>
        <HathorHeader
          title={t`SECURITY`}
          onBackPress={() => this.props.navigation.goBack()}
        />
        <HathorList>
          <ListItem
            title={biometryText}
            // if no biometry is supported, use default ListItem color (grey),
            // so it looks disabled. Else, color is black, as other items
            titleStyle={!switchDisabled ? { color: COLORS.textColor } : null}
            text={(
              <Switch
                onValueChange={this.onBiometrySwitchChange}
                value={this.state.biometryEnabled}
                disabled={switchDisabled}
              />
            )}
            isFirst
          />
          <ListMenu
            title={t`Change PIN`}
            onPress={() => this.props.navigation.navigate('ChangePin')}
          />
          <ListMenu
            title={t`Lock wallet`}
            onPress={this.onLockWallet}
            isLast
          />
        </HathorList>
      </View>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Security);
