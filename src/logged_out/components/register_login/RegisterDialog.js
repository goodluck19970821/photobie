import React, { useState, useCallback, useRef, Fragment } from "react";
import PropTypes from "prop-types";
import {
  FormHelperText,
  TextField,
  Button,
  Checkbox,
  Typography,
  FormControlLabel,
  withStyles,
  Select,
  OutlinedInput,
  MenuItem,
} from "@material-ui/core";
import 'bootstrap/dist/css/bootstrap.min.css';
import FormDialog from "../../../shared/components/FormDialog";
import HighlightedInformation from "../../../shared/components/HighlightedInformation";
import ButtonCircularProgress from "../../../shared/components/ButtonCircularProgress";
import VisibilityPasswordTextField from "../../../shared/components/VisibilityPasswordTextField";
import { Auth } from 'aws-amplify';
import VerifyCode from "./verifyCode"
const styles = (theme) => ({
  link: {
    transition: theme.transitions.create(["background-color"], {
      duration: theme.transitions.duration.complex,
      easing: theme.transitions.easing.easeInOut,
    }),
    cursor: "pointer",
    color: theme.palette.primary.main,
    "&:enabled:hover": {
      color: theme.palette.primary.dark,
    },
    "&:enabled:focus": {
      color: theme.palette.primary.dark,
    },
  },
});

function RegisterDialog(props) {
  const { setStatus, theme, onClose, openTermsDialog, status, classes } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [hasTermsOfServiceError, setHasTermsOfServiceError] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isCofirmVisible,setIsCofirmVisible] = useState(false)
  const [userType, setUserType] = useState("Client");
  const [userTypeFlag, setUserTypeFlag] = useState(1);
  const registerTermsCheckbox = useRef();
  const registerPassword = useRef();
  const registerPasswordRepeat = useRef();
  const loginEmail = useRef();
  const [code, setCode] = useState(1);
  async function register() {
    const username = loginEmail.current.value;
    const password = registerPassword.current.value;
    try {
      const { user } = await Auth.signUp({
          username,
          password,
          attributes: {  
              email:username, 
              "custom:type":userTypeFlag.toString()
          }
      });
      setStatus(null);
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setCode(2)
      }, 1500);
      
    } catch (error) {
        console.log('error signing up:', error);
    }
  }

   async function selectType(event){

      const { name, value } = event.target;
      switch(value){
        case "Client":
          console.log("client")
          setUserTypeFlag(1)
          break;
        case "Provider":
          console.log("provider")
          setUserTypeFlag(2)
          break;
        case "Moderator":
          console.log("moderator")
          setUserTypeFlag(3)
          break;
        case "Admin":
          console.log("admin")
          setUserTypeFlag(4)
          break;
      }
      setUserType(value)
    }

  return (
    <div>
      {code==1?<div  >
      <FormDialog
      loading={isLoading}
      onClose={onClose}

      open
      headline="Sign Up"
      onFormSubmit={(e) => {
        e.preventDefault();
        register();
      }}
      hasCloseIcon
      content={
        <Fragment>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            error={status === "invalidEmail"}
            label="Email Address"
            autoFocus
            autoComplete="off"
            type="email"
            inputRef={loginEmail}
            onChange={() => {
              if (status === "invalidEmail") {
                setStatus(null);
              }
            }}
            FormHelperTextProps={{ error: true }}
          />
          <VisibilityPasswordTextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            
            error={
              status === "passwordTooShort" || status === "passwordsDontMatch"
            }
            label="Password"
            inputRef={registerPassword}
            autoComplete="off"
            onChange={() => {
              if (
                status === "passwordTooShort" ||
                status === "passwordsDontMatch"
              ) {
                setStatus(null);
              }
            }}
            helperText={(() => {
              if (status === "passwordTooShort") {
                return "Create a password at least 6 characters long.";
              }
              if (status === "passwordsDontMatch") {
                return "Your passwords dont match.";
              }
              return null;
            })()}
            FormHelperTextProps={{ error: true }}
            isVisible={isPasswordVisible}
            onVisibilityChange={setIsPasswordVisible}
          />
          <VisibilityPasswordTextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            error={
              status === "passwordTooShort" || status === "passwordsDontMatch"
            }
            label="Repeat Password"
            inputRef={registerPasswordRepeat}
            autoComplete="off"
            onChange={() => {
              if (
                status === "passwordTooShort" ||
                status === "passwordsDontMatch"
              ) {
                setStatus(null);
              }
            }}
            helperText={(() => {
              if (status === "passwordTooShort") {
                return "Create a password at least 6 characters long.";
              }
              if (status === "passwordsDontMatch") {
                return "Your passwords dont match.";
              }
            })()}
            FormHelperTextProps={{ error: true }}
            isVisible={isCofirmVisible}
            onVisibilityChange={setIsCofirmVisible}
          />
          <Typography variant="body1">
            Please select the User Type
          </Typography>
          <Select
            value={userType}
            onChange={selectType}
            fullWidth
            input={
              <OutlinedInput
                name="userType"
                value={userTypeFlag}
                className={classes.numberInput}
                classes={{ input: classes.numberInputInput }}
              />
            }
            MenuProps={{ disableScrollLock: true }}
          >
            {[
              "Client",
              "Provider",
              "Moderator",
              "Admin",
            ].map((element) => (
              <MenuItem value={element} key={element}>
                {element}
              </MenuItem>
            ))}
          </Select>
          <FormControlLabel
            style={{ marginRight: 0 }}
            control={
              <Checkbox
                color="primary"
                inputRef={registerTermsCheckbox}
                onChange={() => {
                  setHasTermsOfServiceError(false);
                }}
              />
            }
            label={
              <Typography variant="body1">
                I agree to the
                <span
                  className={classes.link}
                  onClick={isLoading ? null : openTermsDialog}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(event) => {
                    // For screenreaders listen to space and enter events
                    if (
                      (!isLoading && event.keyCode === 13) ||
                      event.keyCode === 32
                    ) {
                      openTermsDialog();
                    }
                  }}
                >
                  {" "}
                  terms of service
                </span>
              </Typography>
            }
          />

          {hasTermsOfServiceError && (
            <FormHelperText
              error
              style={{
                display: "block",
                marginTop: theme.spacing(-1),
              }}
            >
              In order to create an account, you have to accept our terms of
              service.
            </FormHelperText>
          )}
          
        </Fragment>
      }
      actions={
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          color="secondary"
          disabled={isLoading}
        >
          Sign Up
          {isLoading && <ButtonCircularProgress />}
        </Button>
      }
    />
      </div>:<VerifyCode username = {loginEmail.current.value} onClose = {onClose}/>
    }
      
    </div>
  );
}

RegisterDialog.propTypes = {
  theme: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  openTermsDialog: PropTypes.func.isRequired,
  status: PropTypes.string,
  setStatus: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(RegisterDialog);
