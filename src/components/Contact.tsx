"use client";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { motion } from "framer-motion";
import Image from "next/image";
import SocialIcons from "./SocialIcons";
import { FaLinkedin, FaGithub, FaFacebook } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";

export default function Contact() {
  const team = [
    {
      id: "C243164",
      name: "Mohammad Abu Aftab Wasih",
      photo: "/images/default-person.png",
      work: "UI/UX design and frontend development for the home page, ensuring a visually appealing and interactive user experience.",
      iconData: [
        {
          name: "LinkedIn",
          icon: <FaLinkedin className="size-full" />,
          hoverColor: "text-[#0A66C2]",
          href: "https://www.linkedin.com/in/",
        },
        {
          name: "GitHub",
          icon: <FaGithub className="size-full" />,
          hoverColor: "text-[#6E5494]",
          href: "https://github.com/",
        },
        {
          name: "Facebook",
          icon: <FaFacebook className="size-full" />,
          hoverColor: "text-[#1877F2]",
          href: "https://www.facebook.com/",
        },
        {
          name: "Email",
          icon: <IoMdMail className="size-full" />,
          hoverColor: "text-[#00B2FF]",
          href: "mailto:a@example.com",
        },
      ],
    },
    {
      id: "C243...",
      name: "Hasan Jamil",
      photo: "/images/default-person.png",
      work: "Led the development of the 3D visualization module, creating an immersive and scientifically accurate simulation of asteroid impacts.",
      iconData: [
        {
          name: "LinkedIn",
          icon: <FaLinkedin className="size-full" />,
          hoverColor: "text-[#0A66C2]",
          href: "https://www.linkedin.com/in/",
        },
        {
          name: "GitHub",
          icon: <FaGithub className="size-full" />,
          hoverColor: "text-[#6E5494]",
          href: "https://github.com/",
        },
        {
          name: "Facebook",
          icon: <FaFacebook className="size-full" />,
          hoverColor: "text-[#1877F2]",
          href: "https://www.facebook.com/",
        },
        {
          name: "Email",
          icon: <IoMdMail className="size-full" />,
          hoverColor: "text-[#00B2FF]",
          href: "mailto:a@example.com",
        },
      ],
    },
    {
      id: "C243...",
      name: "Asikuzzaman",
      photo: "/images/default-person.png",
      work: "Responsible for backend development and data integration, ensuring seamless data flow from NASA's APIs to the frontend.",
      iconData: [
        {
          name: "LinkedIn",
          icon: <FaLinkedin className="size-full" />,
          hoverColor: "text-[#0A66C2]",
          href: "https://www.linkedin.com/in/",
        },
        {
          name: "GitHub",
          icon: <FaGithub className="size-full" />,
          hoverColor: "text-[#6E5494]",
          href: "https://github.com/",
        },
        {
          name: "Facebook",
          icon: <FaFacebook className="size-full" />,
          hoverColor: "text-[#1877F2]",
          href: "https://www.facebook.com/",
        },
        {
          name: "Email",
          icon: <IoMdMail className="size-full" />,
          hoverColor: "text-[#00B2FF]",
          href: "mailto:a@example.com",
        },
      ],
    },
    {
      id: "C243...",
      name: "Anowar",
      photo: "/images/default-person.png",
      work: "Contributed to the frontend architecture and state management, ensuring a scalable and performant application.",
      iconData: [
        {
          name: "LinkedIn",
          icon: <FaLinkedin className="size-full" />,
          hoverColor: "text-[#0A66C2]",
          href: "https://www.linkedin.com/in/",
        },
        {
          name: "GitHub",
          icon: <FaGithub className="size-full" />,
          hoverColor: "text-[#6E5494]",
          href: "https://github.com/",
        },
        {
          name: "Facebook",
          icon: <FaFacebook className="size-full" />,
          hoverColor: "text-[#1877F2]",
          href: "https://www.facebook.com/",
        },
        {
          name: "Email",
          icon: <IoMdMail className="size-full" />,
          hoverColor: "text-[#00B2FF]",
          href: "mailto:a@example.com",
        },
      ],
    },
    {
      id: "C243...",
      name: "Arman",
      photo: "/images/default-person.png",
      work: "Focused on testing and quality assurance, ensuring the application is robust, bug-free, and meets all project requirements.",
      iconData: [
        {
          name: "LinkedIn",
          icon: <FaLinkedin className="size-full" />,
          hoverColor: "text-[#0A66C2]",
          href: "https://www.linkedin.com/in/",
        },
        {
          name: "GitHub",
          icon: <FaGithub className="size-full" />,
          hoverColor: "text-[#6E5494]",
          href: "https://github.com/",
        },
        {
          name: "Facebook",
          icon: <FaFacebook className="size-full" />,
          hoverColor: "text-[#1877F2]",
          href: "https://www.facebook.com/",
        },
        {
          name: "Email",
          icon: <IoMdMail className="size-full" />,
          hoverColor: "text-[#00B2FF]",
          href: "mailto:a@example.com",
        },
      ],
    },
  ];

  return (
    <>
      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600"
            initial={{ opacity: 0, y: -50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            viewport={{ once: true }}
          >
            Meet Our Team
          </motion.h2>

          <VerticalTimeline lineColor={"rgba(107, 114, 128, 0.3)"}>
            {team.map((member, i) => (
              <VerticalTimelineElement
                key={member.id + i}
                className="vertical-timeline-element--work"
                contentStyle={{
                  background: "rgba(23, 23, 33, 0.6)",
                  backdropFilter: "blur(10px)",
                  color: "#fff",
                  borderRadius: "1rem",
                  boxShadow: "0 0 25px rgba(0, 200, 200, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
                contentArrowStyle={{
                  borderRight: "7px solid rgba(0, 200, 200, 0.7)",
                }}
                iconStyle={{
                  background:
                    "linear-gradient(135deg, #1E3A8A, #06B6D4)",
                  color: "#fff",
                  boxShadow: "0 0 20px rgba(6, 182, 212, 0.8)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                icon={
                  <Image
                    src={"/team.svg"}
                    alt={member.name + i}
                    width={32}
                    height={32}
                  />
                }
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-space-teal">
                      {member.name}
                    </h3>
                    <h4 className="text-sm text-gray-400">{member.id}</h4>
                  </div>
                  <Image
                    src={member.photo}
                    className="rounded-full border-2 border-space-pink shadow-lg"
                    alt={member.name}
                    width={60}
                    height={60}
                  />
                </div>
                <p className="mt-4 text-gray-300 text-sm leading-relaxed">{member.work}</p>
                <motion.div
                  className="flex justify-center py-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <SocialIcons iconData={member.iconData} />
                </motion.div>
              </VerticalTimelineElement>
            ))}
          </VerticalTimeline>
        </div>
      </section>
    </>
  );
}