import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
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
        <h1 className="text-3xl font-bold text-primary mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground">Last Updated: May 12, 2025</p>
        
        <div className="mt-8">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Swasthya Sathi. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, including our website, mobile applications, and services (collectively, the "Services").
          </p>
          <p>
            By accessing or using our Services, you consent to the collection, use, disclosure, and storage of your information as described in this Privacy Policy. If you do not agree with our policies and practices, please do not use our Services.
          </p>
          <p>
            We understand the sensitivity of health information and are committed to maintaining the confidentiality and security of such information in accordance with applicable laws and regulations.
          </p>

          <h2>2. Information We Collect</h2>

          <h3>2.1 Information You Provide to Us</h3>
          <p>
            We collect information that you voluntarily provide to us when you:
          </p>
          <ul>
            <li>Register for an account</li>
            <li>Complete your profile</li>
            <li>Use our Services</li>
            <li>Contact our support team</li>
            <li>Participate in surveys or promotions</li>
          </ul>
          <p>
            Depending on the type of account (patient or doctor), this information may include:
          </p>
          <ul>
            <li>Personal identification information (name, email address, phone number)</li>
            <li>Authentication information (password and security questions)</li>
            <li>Demographic information (date of birth, gender)</li>
            <li>Profile information (profile picture, biographical information)</li>
            <li>Professional information (for doctors: qualifications, license numbers, specialization, experience)</li>
            <li>Health information (for patients: medical history, allergies, medications, chronic conditions)</li>
            <li>Payment information (if applicable)</li>
          </ul>

          <h3>2.2 Information We Collect Automatically</h3>
          <p>
            When you access or use our Services, we may automatically collect certain information about your device and usage patterns, including:
          </p>
          <ul>
            <li>Device information (device type, operating system, browser type)</li>
            <li>IP address and location information</li>
            <li>Usage information (pages visited, features used, time spent on the platform)</li>
            <li>Log information (access times, error logs)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>
            We use the information we collect for various purposes, including:
          </p>

          <h3>3.1 Providing and Improving Our Services</h3>
          <ul>
            <li>To create and maintain your account</li>
            <li>To facilitate communication between patients and healthcare providers</li>
            <li>To provide personalized healthcare information and services</li>
            <li>To improve our Services and develop new features</li>
            <li>To respond to your inquiries and provide customer support</li>
            <li>To process payments (if applicable)</li>
          </ul>

          <h3>3.2 Analytics and Research</h3>
          <ul>
            <li>To analyze usage patterns and trends</li>
            <li>To evaluate the effectiveness of our Services</li>
            <li>To conduct research and development</li>
            <li>To generate anonymized and aggregated statistics</li>
          </ul>

          <h3>3.3 Communications</h3>
          <ul>
            <li>To send you service-related notifications and updates</li>
            <li>To send you health reminders and alerts (with your consent)</li>
            <li>To communicate about new features or services</li>
            <li>To send marketing communications (with your consent where required)</li>
          </ul>

          <h3>3.4 Security and Compliance</h3>
          <ul>
            <li>To verify your identity and prevent fraud</li>
            <li>To protect the security of our Services</li>
            <li>To enforce our Terms of Service</li>
            <li>To comply with legal obligations</li>
          </ul>

          <h2>4. How We Share Your Information</h2>
          <p>
            We may share your information with the following categories of recipients:
          </p>

          <h3>4.1 Healthcare Providers</h3>
          <p>
            If you are a patient, we share your health information with healthcare providers on our platform whom you choose to consult. This sharing is essential for the provision of healthcare services.
          </p>

          <h3>4.2 Service Providers</h3>
          <p>
            We may share your information with third-party service providers who perform services on our behalf, such as:
          </p>
          <ul>
            <li>Cloud hosting and storage providers</li>
            <li>Payment processors</li>
            <li>Analytics providers</li>
            <li>Customer support services</li>
            <li>Communication and notification services</li>
          </ul>
          <p>
            We require these service providers to protect your information and use it only for the specific purposes for which it was shared.
          </p>

          <h3>4.3 Compliance with Legal Obligations</h3>
          <p>
            We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., court orders, government requests).
          </p>

          <h3>4.4 Business Transfers</h3>
          <p>
            If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction. We will notify you of any such change in ownership or control of your personal information.
          </p>

          <h3>4.5 With Your Consent</h3>
          <p>
            We may share your information in other ways if you have given us your consent to do so.
          </p>

          <h2>5. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to fulfill the purposes for which it was collected, including for the purposes of satisfying any legal, regulatory, accounting, or reporting requirements. 
          </p>
          <p>
            For health information, we retain data in accordance with applicable healthcare regulations and best practices for medical records retention. In some jurisdictions, this may be 7-10 years or longer from the last patient interaction.
          </p>
          <p>
            When determining the appropriate retention period, we consider:
          </p>
          <ul>
            <li>The amount, nature, and sensitivity of the information</li>
            <li>The potential risk of harm from unauthorized use or disclosure</li>
            <li>The purposes for which we process the information</li>
            <li>Whether we can achieve those purposes through other means</li>
            <li>Applicable legal requirements</li>
          </ul>

          <h2>6. Data Security</h2>
          <p>
            We have implemented appropriate technical and organizational measures to protect your personal information from unauthorized access, use, disclosure, alteration, or destruction. These measures include:
          </p>
          <ul>
            <li>Encryption of sensitive information (both in transit and at rest)</li>
            <li>Access controls and authentication requirements</li>
            <li>Regular security assessments and audits</li>
            <li>Staff training on data protection and security</li>
            <li>Physical and technological safeguards</li>
          </ul>
          <p>
            While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.
          </p>

          <h2>7. Your Privacy Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>

          <h3>7.1 Access and Portability</h3>
          <p>
            You have the right to access the personal information we hold about you and, in some cases, to receive a copy of this information in a structured, commonly used, and machine-readable format.
          </p>

          <h3>7.2 Correction</h3>
          <p>
            You have the right to request the correction of inaccurate or incomplete personal information we hold about you.
          </p>

          <h3>7.3 Deletion</h3>
          <p>
            You have the right to request the deletion of your personal information in certain circumstances. Please note that we may be required to retain certain information for legal or compliance reasons.
          </p>

          <h3>7.4 Restriction and Objection</h3>
          <p>
            You have the right to request that we restrict the processing of your personal information in certain circumstances. You also have the right to object to our processing of your personal information in certain cases.
          </p>

          <h3>7.5 Withdrawing Consent</h3>
          <p>
            Where we process your personal information based on your consent, you have the right to withdraw that consent at any time. This will not affect the lawfulness of processing based on your consent before its withdrawal.
          </p>

          <h3>7.6 Exercising Your Rights</h3>
          <p>
            To exercise any of these rights, please contact us using the information provided in the "Contact Us" section below. We will respond to your request within the timeframe required by applicable law. We may need to verify your identity before fulfilling your request.
          </p>

          <h2>8. Children's Privacy</h2>
          <p>
            Our Services are not intended for children under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us, and we will take steps to delete such information.
          </p>

          <h2>9. International Data Transfers</h2>
          <p>
            Your personal information may be transferred to, and processed in, countries other than the country in which you reside. These countries may have data protection laws that are different from the laws of your country.
          </p>
          <p>
            If we transfer your personal information to other countries, we will take appropriate safeguards to ensure that your personal information remains protected in accordance with this Privacy Policy and applicable law.
          </p>

          <h2>10. Cookies and Similar Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to collect information about your use of our Services. Cookies are small data files stored on your device that help us improve our Services and your experience, see which areas and features of our Services are popular, and count visits.
          </p>
          <p>
            You can set your browser to refuse all or some browser cookies, or to alert you when cookies are being sent. If you disable or refuse cookies, please note that some parts of the Services may be inaccessible or not function properly.
          </p>

          <h2>11. Third-Party Links and Services</h2>
          <p>
            Our Services may contain links to third-party websites, services, or applications that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services. We encourage you to review the privacy policies of these third parties.
          </p>

          <h2>12. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. The updated version will be indicated by an updated "Last Updated" date. If we make material changes to this Privacy Policy, we will notify you either through the email address associated with your account or by prominently posting a notice on our Services. We encourage you to review this Privacy Policy periodically for any changes.
          </p>
          <p>
            Your continued use of our Services after the revised Privacy Policy has been posted signifies your acknowledgment of such changes and your agreement to be bound by the revised Privacy Policy.
          </p>

          <h2>13. Contact Us</h2>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:
          </p>
          <p>
            <strong>Swasthya Sathi Privacy Office</strong><br />
            Email: privacy@swasthyasathi.com<br />
            Address: Swasthya Sathi Healthcare Technologies<br />
            123 Health Avenue, Delhi, 110001, India<br />
            Phone: +91 11 1234 5678
          </p>
          <p>
            We will respond to your inquiry as soon as possible and within the timeframe required by applicable law.
          </p>

          <h2>14. Complaints</h2>
          <p>
            If you have a complaint about how we have handled your personal information, please contact us using the information above. If you are not satisfied with our response, you may have the right to lodge a complaint with a data protection authority or other regulatory agency in your country of residence.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy; 