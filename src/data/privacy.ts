import type { PrivacyBlock, PrivacyBlockType, PrivacySection } from "@/types/privacy";

export type { PrivacyBlock, PrivacyBlockType, PrivacySection };

export const privacySections: PrivacySection[] = [
  {
    id: "overview",
    number: "01",
    title: "General Information & Scope",
    summary: "Scope of policy, legal definitions, translation priority, and cross-border processing.",
    iconName: "Globe",
    blocks: [
      { type: "heading", text: "DIGISAY LLC" },
      {
        type: "paragraph",
        text: "Please read the following to learn more about Our Privacy Policy and the ways in which We use Your information before You proceed with use of Our website www.digisay.com (“Website”).",
      },
      {
        type: "paragraph",
        text: "This Privacy Policy has been drafted in English and has been translated into other languages. In the event of any discrepancy between the English and the translated texts, the English text shall prevail and be used to solve doubts of interpretation.",
      },
      { type: "paragraph", text: "Date of issue of this Privacy Policy: August 2022" },
      { type: "subheading", text: "International Transfer" },
      {
        type: "paragraph",
        text: "YOUR INFORMATION IS PROCESSED IN EITHER THE UNITED ARAB EMIRATES OR EGYPT, AND MAY BE PROCESSED ELSEWHERE DEPENDING ON THE LOCATION OF AFFILIATES, BUSINESS PARTNERS, AND OTHER ENTITIES WHO ARE PERMITTED TO ACCESS SUCH INFORMATION UNDER THE TERMS OF THIS PRIVACY POLICY (AND SUCH LOCATIONS OUTSIDE THE UNITED ARAB EMIRATES OR EGYPT THAT MAY INCLUDE COUNTRIES WHICH MAY NOT AFFORD THE SAME LEVEL OF PROTECTION OF SUCH DATA AS THE COUNTRY FROM WHICH YOU PROVIDED THE INFORMATION). BY ACCESSING OR USING THE WEBSITE OR SUBMITTING PERSONAL INFORMATION TO US, YOU SPECIFICALLY AGREE TO THAT TRANSFER AND ANY RELATED PURPOSES.",
      },
    ],
  },
  {
    id: "data-collected",
    number: "02",
    title: "Types of Data Collected",
    summary: "Cookies, Usage Data, mandatory vs voluntary disclosures, and third-party content consent.",
    iconName: "Database",
    blocks: [
      { type: "subheading", text: "Types of Data collected" },
      {
        type: "paragraph",
        text: "Among the types of personal data that the Website collects, by itself or through third parties, there are: Cookies; Usage Data.",
      },
      {
        type: "paragraph",
        text: "Complete details on each type of personal data collected are provided in the dedicated sections of this privacy policy or by specific explanation texts displayed prior to the data collection. Personal data may be freely provided by the user, or, in case of usage data, collected automatically when using the Website. Unless specified otherwise, all data requested by the Website is mandatory and failure to provide this data may make it impossible or at least difficult for the Website to provide its services. In cases where the Website specifically states that some data is not mandatory, users are free not to communicate this data without consequences to the availability or the functioning of the service. Users who are uncertain about which personal data is mandatory are welcome to contact DigiSay. Any use of Cookies – or of other tracking tools – by the Website or by third-party services used on the Website serves the purpose of providing the service required by the user, in addition to any other purposes described in the present document and in the Cookie Policy, if available.",
      },
      {
        type: "paragraph",
        text: "Users are responsible for any third-party personal data obtained, published or shared through the Website and confirm that they have the third party's consent to provide the data to DigiSay.",
      },
    ],
  },
  {
    id: "processing",
    number: "03",
    title: "Mode, Place & Legal Basis of Processing",
    summary: "Security safeguards, authorized personnel, lawful basis, operating regions, and retention periods.",
    iconName: "ShieldCheck",
    blocks: [
      { type: "subheading", text: "Mode and place of processing the Data" },
      { type: "subheading", text: "Methods of processing" },
      {
        type: "paragraph",
        text: "DigiSay takes appropriate security measures to prevent unauthorized access, disclosure, modification, or unauthorized destruction of the data. The data processing is carried out using computers and/or IT enabled tools, following organizational procedures and modes strictly related to the purposes indicated. In addition to DigiSay, in some cases, the data may be accessible to certain types of persons in charge, involved with the operation of the Website (administration, sales, marketing, legal, system administration) or external parties (such as third-party technical service providers, mail carriers, hosting providers, IT companies, communications agencies) appointed, if necessary, as Data Processors by DigiSay. The updated list of these parties may be requested from DigiSay at any time.",
      },
      { type: "subheading", text: "Legal basis of processing" },
      {
        type: "paragraph",
        text: "DigiSay may process personal data relating to users if one of the following applies:",
      },
      {
        type: "bullet",
        text: "Users have given their consent for one or more specific purposes. Note: Under some legislations DigiSay may be allowed to process personal data until the user objects to such processing (“opt-out”), without having to rely on consent or any other of the following legal bases. This, however, does not apply, whenever the processing of personal data is subject to European data protection law;",
      },
      {
        type: "bullet",
        text: "provision of data is necessary for the performance of an agreement with the user and/or for any pre-contractual obligations thereof;",
      },
      {
        type: "bullet",
        text: "processing is necessary for compliance with a legal obligation to which DigiSay is subject;",
      },
      {
        type: "bullet",
        text: "processing is related to a task that is carried out in the public interest or in the exercise of official authority vested in DigiSay;",
      },
      {
        type: "bullet",
        text: "processing is necessary for the purposes of the legitimate interests pursued by DigiSay or by a third party.",
      },
      {
        type: "paragraph",
        text: "In any case, DigiSay will gladly help to clarify the specific legal basis that applies to the processing, and in particular whether the provision of personal data is a statutory or contractual requirement, or a requirement necessary to enter into a contract.",
      },
      { type: "subheading", text: "Place" },
      {
        type: "paragraph",
        text: "The data is processed at DigiSay's operating offices and in any other places where the parties involved in the processing are located. Depending on the user's location, data transfers may involve transferring the user's data to a country other than their own. To find out more about the place of processing of such transferred data, users can check the section containing details about the processing of personal data.",
      },
      {
        type: "paragraph",
        text: "Users are also entitled to learn about the legal basis of data transfers to a country outside the European Union or to any international organization governed by public international law or set up by two or more countries, such as the UN, and about the security measures taken by DigiSay to safeguard their data. If any such transfer takes place, users can find out more by checking the relevant sections of this document or inquire with DigiSay using the information provided in the contact section.",
      },
      { type: "subheading", text: "Retention time" },
      {
        type: "paragraph",
        text: "Personal data shall be processed and stored for as long as required by the purpose they have been collected for.",
      },
      { type: "paragraph", text: "Therefore:" },
      {
        type: "bullet",
        text: "Personal data collected for purposes related to the performance of a contract between DigiSay and the user shall be retained until such contract has been fully performed.",
      },
      {
        type: "bullet",
        text: "Personal data collected for the purposes of DigiSay's legitimate interests shall be retained as long as needed to fulfill such purposes. Users may find specific information regarding the legitimate interests pursued by DigiSay within the relevant sections of this document or by contacting DigiSay.",
      },
      {
        type: "paragraph",
        text: "DigiSay may be allowed to retain personal data for a longer period whenever the user has given consent to such processing, as long as such consent is not withdrawn. Furthermore, DigiSay may be obliged to retain personal data for a longer period whenever required to do so for the performance of a legal obligation or upon order of an authority. Once the retention period expires, personal data shall be deleted. Therefore, the right to access, the right to erasure, the right to rectification and the right to data portability cannot be enforced after expiration of the retention period.",
      },
    ],
  },
  {
    id: "third-party",
    number: "04",
    title: "Third-Party Services, Analytics & Ads",
    summary: "Integration details for Google Ad Manager, Google Analytics, Firebase, cloud hosting, and push notifications.",
    iconName: "BarChart3",
    blocks: [
      { type: "subheading", text: "The purposes of processing" },
      {
        type: "paragraph",
        text: "The data concerning the user is collected to allow DigiSay to provide its services, as well as for the following purposes: Advertising, Analytics and Hosting and backend infrastructure.",
      },
      {
        type: "paragraph",
        text: "Users can find further detailed information about such purposes of processing and about the specific personal data used for each purpose in the respective sections of this document.",
      },
      { type: "subheading", text: "Detailed information on the processing of Personal Data" },
      {
        type: "paragraph",
        text: "Personal data is collected for the following purposes and using the following services:",
      },
      { type: "subheading", text: "Advertising" },
      {
        type: "paragraph",
        text: "This type of service allows user data to be utilized for advertising communication purposes displayed in the form of banners and other advertisements on the Website, possibly based on user interests. This does not mean that all personal data are used for this purpose. Information and conditions of use are shown below. Some of the services listed below may use Cookies to identify users or they may use the behavioral retargeting technique, i.e. displaying ads tailored to the user's interests and behavior, including those detected outside the Website. For more information, please check the privacy policies of the relevant services.",
      },
      {
        type: "paragraph",
        text: "In addition to any opt-out offered by any of the services below, the user may opt out of a third-party service's use of cookies for certain advertising features by visiting the Network Advertising Initiative opt-out page http://optout.networkadvertising.org/?c=1.",
      },
      {
        type: "paragraph",
        text: "Users may also opt-out of certain advertising features through applicable device settings, such as the device advertising settings for mobile phones or ads settings in general.",
      },
      { type: "subheading", text: "Google Ad Manager (Google Ireland Limited)" },
      {
        type: "paragraph",
        text: "Google Ad Manager is an advertising service provided by Google Ireland Limited that allows DigiSay to run advertising campaigns in conjunction with external advertising networks that DigiSay, unless otherwise specified in this document, has no direct relationship with. In order to opt out from being tracked by various advertising networks, Users may make use of Youronlinechoices. In order to understand Google's use of data, consult Google's partner policy. This service uses the “DoubleClick” Cookie, which tracks use of the Website and User behavior concerning ads, products and services offered.",
      },
      {
        type: "paragraph",
        text: "Users may decide to disable all the DoubleClick Cookies by going to: Google Ad Settings.",
      },
      { type: "bullet", text: "Personal Data collected: Cookies; Usage Data." },
      {
        type: "bullet",
        text: "Place of processing: Ireland – Privacy Policy. Privacy Shield participant.",
      },
      { type: "subheading", text: "Analytics" },
      {
        type: "paragraph",
        text: "The services contained in this section enable DigiSay to monitor and analyze web traffic and can be used to keep track of User behavior.",
      },
      { type: "subheading", text: "Google Analytics (Google Ireland Limited)" },
      {
        type: "paragraph",
        text: "Google Analytics is a web analysis service provided by Google Ireland Limited (“Google”). Google utilizes the data collected to track and examine the use of the Website, to prepare reports on its activities and share them with other Google services. Google may use the data collected to contextualize and personalize the ads of its own advertising network.",
      },
      { type: "bullet", text: "Personal data collected: Cookies; usage data." },
      {
        type: "bullet",
        text: "Place of processing: Ireland – Privacy Policy – Opt Out. Privacy Shield participant.",
      },
      { type: "subheading", text: "Google Firebase" },
      {
        type: "paragraph",
        text: "The service is a Google-backed application development software that enables developers to develop iOS, Android and Web apps.",
      },
      {
        type: "bullet",
        text: "Place of processing: Ireland – Privacy Policy – Opt Out. Privacy Shield participant.",
      },
      { type: "subheading", text: "Hosting and backend infrastructure" },
      {
        type: "paragraph",
        text: "This type of service has the purpose of hosting data and files that enable the Website to run and be distributed as well as to provide a ready-made infrastructure to run specific features or parts of the Website.",
      },
      {
        type: "paragraph",
        text: "Some services among those listed below, if any, may work through geographically distributed servers, making it difficult to determine the actual location where the personal data are stored.",
      },
      { type: "subheading", text: "Further information about Personal Data" },
      { type: "subheading", text: "Push notifications" },
      {
        type: "paragraph",
        text: "The Website may send push notifications to the user to achieve the purposes outlined in this privacy policy.",
      },
      {
        type: "paragraph",
        text: "Users may in most cases opt-out of receiving push notifications by visiting their device settings, such as the notification settings for mobile phones, and then change those settings for the Website, some or all of the apps on the particular device. Users must be aware that disabling push notifications may negatively affect the utility of the Website.",
      },
    ],
  },
  {
    id: "user-rights",
    number: "05",
    title: "User Rights & Data Protection",
    summary: "Your rights under GDPR & regional frameworks: access, rectification, erasure, portability, and complaints.",
    iconName: "UserCheck",
    blocks: [
      { type: "subheading", text: "The rights of Users" },
      {
        type: "paragraph",
        text: "Users may exercise certain rights regarding their data processed by DigiSay.",
      },
      { type: "paragraph", text: "In particular, users have the right to do the following:" },
      {
        type: "bullet",
        text: "Withdraw their consent at any time. Users have the right to withdraw consent where they have previously given their consent to the processing of their Personal Data.",
      },
      {
        type: "bullet",
        text: "Object to processing of their data. Users have the right to object to the processing of their Data if the processing is carried out on a legal basis other than consent. Further details are provided in the dedicated section below.",
      },
      {
        type: "bullet",
        text: "Access their data. Users have the right to learn if data is being processed by DigiSay, obtain disclosure regarding certain aspects of the processing and obtain a copy of the data undergoing processing.",
      },
      {
        type: "bullet",
        text: "Verify and seek rectification. Users have the right to verify the accuracy of their data and ask for it to be updated or corrected.",
      },
      {
        type: "bullet",
        text: "Restrict the processing of their data. Users have the right, under certain circumstances, to restrict the processing of their data. In this case, DigiSay will not process their data for any purpose other than storing it.",
      },
      {
        type: "bullet",
        text: "Have their personal data deleted or otherwise removed. Users have the right, under certain circumstances, to obtain the erasure of their data from DigiSay.",
      },
      {
        type: "bullet",
        text: "Receive their data and have it transferred to another controller. Users have the right to receive their data in a structured, commonly used and machine-readable format and, if technically feasible, to have it transmitted to another controller without any hindrance. This provision is applicable provided that the data is processed by automated means and that the processing is based on the User's consent, on a contract which the User is part of or on pre-contractual obligations thereof.",
      },
      {
        type: "bullet",
        text: "Lodge a complaint. Users have the right to bring a claim before their competent data protection authority.",
      },
      { type: "subheading", text: "Details about the right to object to processing" },
      {
        type: "paragraph",
        text: "Where personal data is processed for a public interest, in the exercise of an official authority vested in DigiSay or for the purposes of the legitimate interests pursued by DigiSay, users may object to such processing by providing a ground related to their particular situation to justify the objection.",
      },
      {
        type: "paragraph",
        text: "Users must know that, however, should their personal data be processed for direct marketing purposes, they can object to that processing at any time without providing any justification. To learn, whether DigiSay is processing personal data for direct marketing purposes, users may refer to the relevant sections of this document.",
      },
      { type: "subheading", text: "How to exercise these rights" },
      {
        type: "paragraph",
        text: "Any requests to exercise user rights can be directed to DigiSay through the contact details provided in this document. These requests can be exercised free of charge and will be addressed by DigiSay as early as possible and always within one month.",
      },
      {
        type: "paragraph",
        text: "Additional information about Data collection and processing",
      },
    ],
  },
  {
    id: "legal",
    number: "06",
    title: "Legal Action, Compliance & Disclaimers",
    summary: "Judicial proceedings, system logs, Do Not Track handling, policy revisions, and limitation of liability.",
    iconName: "Scale",
    blocks: [
      { type: "subheading", text: "Legal action" },
      {
        type: "paragraph",
        text: "The user's personal data may be used for legal purposes by DigiSay in Court or in the stages leading to possible legal action arising from improper use of the Website or the related Services. The user declares to be aware that DigiSay may be required to reveal personal data upon request of public authorities.",
      },
      { type: "subheading", text: "Additional information about User's Personal Data" },
      {
        type: "paragraph",
        text: "In addition to the information contained in this privacy policy, the Website may provide the user with additional and contextual information concerning particular services or the collection and processing of personal data upon request.",
      },
      { type: "subheading", text: "System logs and maintenance" },
      {
        type: "paragraph",
        text: "For operation and maintenance purposes, the Website and any third-party services may collect files that record interaction with the Website (System logs) and use other Personal Data (such as the IP Address) for this purpose.",
      },
      { type: "subheading", text: "Information not contained in this policy" },
      {
        type: "paragraph",
        text: "More details concerning the collection or processing of personal data may be requested from DigiSay at any time. Please see the contact information at the beginning of this document.",
      },
      { type: "subheading", text: "How “Do Not Track” requests are handled" },
      {
        type: "paragraph",
        text: "The Website does not support “Do Not Track” requests. To determine whether any of the third-party services it uses honor the “Do Not Track” requests, please read their privacy policies.",
      },
      { type: "subheading", text: "Changes to this privacy policy" },
      {
        type: "paragraph",
        text: "DigiSay reserves the right to make changes to this privacy policy at any time by giving notice to its users on this page and possibly within the Website and/or – as far as technically and legally feasible – sending a notice to users via any contact information available to DigiSay. It is strongly recommended to check this page often, referring to the date of the last modification listed at the bottom. Should the changes affect processing activities performed on the basis of the user's consent, DigiSay shall collect new consent from the user, where required.",
      },
      { type: "subheading", text: "Definitions and legal references" },
      { type: "subheading", text: "Legal information" },
      {
        type: "paragraph",
        text: "This privacy statement has been prepared based on provisions of multiple legislations, including the Egyptian Data Protection Law no. 151 of 2020 and the Emirati laws and regulations pertaining to data protection.",
      },
      {
        type: "paragraph",
        text: "This privacy policy relates solely to the Website, if not stated otherwise within this document.",
      },
      { type: "subheading", text: "Limitation of Liability" },
      {
        type: "paragraph",
        text: "By accepting to use the Website, the user accepts to release DigiSay in advance from any responsibility or liability whatsoever except for cases of fraud and willful misconduct.",
      },
    ],
  },
];

// Flat export for backward-compatibility
export const privacyBlocks: PrivacyBlock[] = privacySections.flatMap((s) => s.blocks);
