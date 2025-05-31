import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container max-w-4xl py-12 px-4"
    >
      <Link 
        to="/" 
        className="inline-flex items-center text-primary hover:underline mb-8"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to home
      </Link>
      
      <div className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold text-primary mb-6">Terms of Service</h1>
        <p className="text-muted-foreground">Last Updated: May 12, 2025</p>
        
        <div className="mt-8">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Swasthya Sathi ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of the Swasthya Sathi platform, including our website, mobile applications, and any services offered through the platform (collectively, the "Services").
          </p>
          <p>
            By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use our Services. Please read these Terms carefully before proceeding.
          </p>

          <h2>2. Eligibility</h2>
          <p>
            You must be at least 18 years old to use our Services. By using our Services, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these Terms. If you are using our Services on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.
          </p>

          <h2>3. Account Registration</h2>
          <p>
            To access certain features of our Services, you may need to create an account. You agree to provide accurate, current, and complete information during the registration process and to keep your account information updated. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>
          <p>
            We reserve the right to suspend or terminate your account at our discretion if we believe that you have violated these Terms or if your account has been compromised.
          </p>

          <h2>4. User Roles and Specific Terms</h2>
          
          <h3>4.1 Patient Users</h3>
          <p>
            If you register as a patient, you may use our Services to access and manage your health information, communicate with healthcare providers, and utilize other patient-specific features.
          </p>
          <p>
            You acknowledge that the information and services provided through our platform are not meant to replace professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions you may have regarding a medical condition.
          </p>
          
          <h3>4.2 Doctor Users</h3>
          <p>
            If you register as a doctor, you represent and warrant that you hold all necessary licenses, certifications, and qualifications to practice medicine in your jurisdiction and that these are current and valid.
          </p>
          <p>
            You agree to provide accurate and complete information about your professional credentials, qualifications, and practice. You understand that your profile must be approved by our administrative team before you can fully access doctor-specific features.
          </p>
          <p>
            As a doctor, you remain solely responsible for the medical advice, treatment recommendations, and any other professional services you provide through our platform. You agree to comply with all applicable laws, regulations, and professional standards.
          </p>

          <h2>5. User Content</h2>
          <p>
            Our Services allow you to post, submit, or transmit content, including but not limited to text, images, and other materials ("User Content"). You retain all rights in the User Content you submit, but you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute such User Content in connection with providing the Services.
          </p>
          <p>
            You are solely responsible for your User Content and the consequences of posting it. By submitting User Content, you represent and warrant that:
          </p>
          <ul>
            <li>You own or have the necessary rights to use and authorize us to use your User Content</li>
            <li>Your User Content does not violate any third party's intellectual property rights, privacy rights, or other rights</li>
            <li>Your User Content complies with these Terms and all applicable laws and regulations</li>
          </ul>
          <p>
            We reserve the right to review, remove, or modify User Content at our sole discretion, including User Content that we believe violates these Terms or our policies.
          </p>

          <h2>6. Healthcare Information and Privacy</h2>
          <p>
            Our handling of health information is governed by our Privacy Policy and applicable laws, including healthcare privacy laws in your jurisdiction. You acknowledge that you have read and understood our Privacy Policy, which is incorporated into these Terms by reference.
          </p>
          <p>
            You understand that healthcare providers on our platform may access and use your health information as permitted by our Privacy Policy and applicable laws. You consent to our collection, use, and disclosure of your health information as described in our Privacy Policy.
          </p>

          <h2>7. Prohibited Activities</h2>
          <p>
            When using our Services, you agree not to:
          </p>
          <ul>
            <li>Violate any applicable law, regulation, or professional standard</li>
            <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity</li>
            <li>Use our Services to transmit any viruses, malware, or other harmful code</li>
            <li>Interfere with or disrupt the operation of our Services or servers</li>
            <li>Attempt to gain unauthorized access to any part of our Services</li>
            <li>Use our Services to send unsolicited communications or advertisements</li>
            <li>Collect or harvest information about other users without their consent</li>
            <li>Use our Services in any manner that could disable, overburden, or impair the Services</li>
            <li>Post or transmit content that is unlawful, fraudulent, threatening, abusive, libelous, defamatory, obscene, or otherwise objectionable</li>
          </ul>

          <h2>8. Intellectual Property</h2>
          <p>
            All content, features, and functionality of our Services, including but not limited to text, graphics, logos, icons, images, audio clips, and software, are owned by us, our licensors, or other providers and are protected by copyright, trademark, patent, and other intellectual property laws.
          </p>
          <p>
            You are granted a limited, non-exclusive, non-transferable, and revocable license to access and use our Services for their intended purposes. You may not copy, modify, distribute, sell, or lease any part of our Services without our prior written consent.
          </p>

          <h2>9. Disclaimers</h2>
          <p>
            THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p>
            WE DO NOT WARRANT THAT THE SERVICES WILL FUNCTION UNINTERRUPTED, SECURE, OR AVAILABLE AT ANY PARTICULAR TIME OR LOCATION; THAT ANY ERRORS OR DEFECTS WILL BE CORRECTED; OR THAT THE SERVICES ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
          </p>
          <p>
            MEDICAL INFORMATION PROVIDED THROUGH OUR SERVICES IS FOR INFORMATIONAL PURPOSES ONLY AND DOES NOT CONSTITUTE MEDICAL ADVICE, DIAGNOSIS, OR TREATMENT. ALWAYS SEEK THE ADVICE OF YOUR PHYSICIAN OR OTHER QUALIFIED HEALTHCARE PROVIDER WITH ANY QUESTIONS YOU MAY HAVE REGARDING A MEDICAL CONDITION.
          </p>

          <h2>10. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL WE, OUR AFFILIATES, OR THEIR RESPECTIVE OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
          </p>
          <ul>
            <li>YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES</li>
            <li>ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICES</li>
            <li>ANY CONTENT OBTAINED FROM THE SERVICES</li>
            <li>UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT</li>
          </ul>
          <p>
            OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATING TO THE SERVICES OR THESE TERMS SHALL NOT EXCEED THE AMOUNT YOU HAVE PAID TO US FOR USE OF THE SERVICES IN THE PAST SIX MONTHS.
          </p>

          <h2>11. Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless us, our affiliates, and their respective officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including, without limitation, reasonable legal and accounting fees, arising out of or in any way connected with your access to or use of the Services, your violation of these Terms, or your violation of any third-party rights.
          </p>

          <h2>12. Termination</h2>
          <p>
            We may terminate or suspend your access to the Services immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms. Upon termination, your right to use the Services will immediately cease.
          </p>
          <p>
            You may terminate your account at any time by contacting us. Some provisions of these Terms may survive termination, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
          </p>

          <h2>13. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any legal action or proceeding arising out of or relating to these Terms or your use of the Services shall be exclusively brought in the courts located in Delhi, India, and you consent to the personal jurisdiction of such courts.
          </p>

          <h2>14. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. If we make material changes to these Terms, we will provide notice through our Services, or by other means, to give you the opportunity to review the changes before they become effective. Your continued use of our Services after any such changes constitutes your acceptance of the new Terms.
          </p>

          <h2>15. Severability</h2>
          <p>
            If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that these Terms will otherwise remain in full force and effect and enforceable.
          </p>

          <h2>16. Entire Agreement</h2>
          <p>
            These Terms, together with our Privacy Policy and any other legal notices and agreements published by us on the Services, constitute the entire agreement between you and us concerning the Services.
          </p>

          <h2>17. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p>
            <strong>Swasthya Sathi Support</strong><br />
            Email: support@swasthyasathi.com<br />
            Address: Swasthya Sathi Healthcare Technologies<br />
            123 Health Avenue, Delhi, 110001, India
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default TermsOfService; 