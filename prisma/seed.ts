import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (optional - for clean start)
  await prisma.grade.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const studentPassword = await bcrypt.hash("student123", 10);
  const lecturerPassword = await bcrypt.hash("lecturer123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);

  const student = await prisma.user.create({
    data: {
      name: "Aminata Kamara",
      email: "student@acosat.edu",
      password: studentPassword,
      role: "student",
    },
  });

  const lecturer = await prisma.user.create({
    data: {
      name: "Dr. Ibrahim Sesay",
      email: "lecturer@acosat.edu",
      password: lecturerPassword,
      role: "lecturer",
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@acosat.edu",
      password: adminPassword,
      role: "admin",
    },
  });

  // Create some courses
  await prisma.course.createMany({
    data: [
      {
        code: "CS 301",
        title: "Data Structures & Algorithms",
        description: "Core algorithms and data structures for computer science.",
        credits: 4,
        status: "open",
        department: "Computer Science",
        lecturerId: lecturer.id,
      },
      {
        code: "CS 320",
        title: "Database Systems",
        description: "Relational databases, SQL, and database design.",
        credits: 4,
        status: "open",
        department: "Computer Science",
        lecturerId: lecturer.id,
      },
      {
        code: "MATH 210",
        title: "Discrete Mathematics",
        description: "Logic, sets, graphs and combinatorics.",
        credits: 3,
        status: "open",
        department: "Computer Science",
        lecturerId: lecturer.id,
      },
      {
        code: "CS 350",
        title: "Artificial Intelligence Fundamentals",
        description: "Introduction to AI and machine learning concepts.",
        credits: 4,
        status: "open",
        department: "Computer Science",
        lecturerId: lecturer.id,
      },
      {
        code: "CS 410",
        title: "Cybersecurity Essentials",
        description: "Network security, cryptography and ethical hacking.",
        credits: 3,
        status: "limited",
        department: "Computer Science",
        lecturerId: lecturer.id,
      },
      {
        code: "HS 101",
        title: "Introduction to Public Health",
        description: "Foundations of public health and community health systems.",
        credits: 3,
        status: "open",
        department: "Health Science",
        lecturerId: lecturer.id,
      },
      {
        code: "BUS 220",
        title: "Principles of Management",
        description: "Core principles of business management and leadership.",
        credits: 3,
        status: "open",
        department: "Business Management",
        lecturerId: lecturer.id,
      },
    ],
  });

  console.log("Database seeded successfully!");
  console.log({ student: student.email, lecturer: lecturer.email, admin: admin.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });