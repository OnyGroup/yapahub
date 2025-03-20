import pjsua2 as pj
import os
# from decouple import config
from django.conf import settings

# SIP_USERNAME = config('SIP_USERNAME')
# SIP_PASSWORD = config('SIP_PASSWORD')
SIP_DOMAIN = "ke.sip.africastalking.com"

class MyAccount(pj.Account):
    def onRegState(self, prm):
        print(f"Registration status: {prm.code}")

class SIPClient:
    def __init__(self):
        self.ep = pj.Endpoint()
        self.ep.libCreate()
        self.ep.libInit(pj.EpConfig())

        # Transport configuration
        tcfg = pj.TransportConfig()
        tcfg.port = 5060
        self.ep.transportCreate(pj.TransportType.UDP, tcfg)

        # Fix: Set Null Audio Device to prevent errors
        self.ep.audDevManager.setNullDev()

        self.ep.libStart()

        # Account configuration
        acfg = pj.AccountConfig()
        # acfg.idUri = f"sip:{SIP_USERNAME}@{SIP_DOMAIN}"
        # acfg.regConfig.registrarUri = f"sip:{SIP_DOMAIN}"
        # acfg.sipConfig.authCreds.append(pj.AuthCredInfo("digest", "*", SIP_USERNAME, 0, SIP_PASSWORD))
        acfg.idUri = f"sip:{settings.SIP_USERNAME}@ke.sip.africastalking.com"
        acfg.regConfig.registrarUri = f"sip:ke.sip.africastalking.com"
        acfg.sipConfig.authCreds.append(pj.AuthCredInfo("digest", "*", settings.SIP_USERNAME, 0, settings.SIP_PASSWORD))

        self.account = MyAccount()
        self.account.create(acfg)
        print("SIP account created and registered.")

    def make_call(self, to_number):
        # Register the current thread with pjsua2
        try:
            pj.Endpoint.instance().utilThreadRegister("PythonThread")
        except Exception as e:
            # Thread might already be registered
            print(f"Thread registration warning: {str(e)}")
            pass
        
        call = pj.Call(self.account)
        prm = pj.CallOpParam()
        prm.opt.audioCount = 1
        call.makeCall(f"sip:{to_number}@{SIP_DOMAIN}", prm)
        print(f"Calling {to_number} via SIP...")
        
        # add a small delay to ensure the call starts
        # before Django destroys the thread
        import time
        time.sleep(5)

if __name__ == "__main__":
    client = SIPClient()
    client.make_call("recipient_number")
