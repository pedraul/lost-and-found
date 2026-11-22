DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'found_items' AND column_name = 'overall_image_file_name')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'found_items' AND column_name = 'overall_file_name') THEN
    ALTER TABLE found_items RENAME COLUMN overall_image_file_name TO overall_file_name;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'found_items' AND column_name = 'serial_image_file_name')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'found_items' AND column_name = 'serial_file_name') THEN
    ALTER TABLE found_items RENAME COLUMN serial_image_file_name TO serial_file_name;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'found_items' AND column_name = 'front_image_file_name')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'found_items' AND column_name = 'front_file_name') THEN
    ALTER TABLE found_items RENAME COLUMN front_image_file_name TO front_file_name;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'found_items' AND column_name = 'back_image_file_name')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'found_items' AND column_name = 'back_file_name') THEN
    ALTER TABLE found_items RENAME COLUMN back_image_file_name TO back_file_name;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'found_items' AND column_name = 'side_image_file_name')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'found_items' AND column_name = 'side_file_name') THEN
    ALTER TABLE found_items RENAME COLUMN side_image_file_name TO side_file_name;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'found_items' AND column_name = 'interior_image_file_name')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'found_items' AND column_name = 'interior_file_name') THEN
    ALTER TABLE found_items RENAME COLUMN interior_image_file_name TO interior_file_name;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'found_items' AND column_name = 'damage_image_file_name')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'found_items' AND column_name = 'damage_file_name') THEN
    ALTER TABLE found_items RENAME COLUMN damage_image_file_name TO damage_file_name;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'found_items' AND column_name = 'distinctive_image_file_name')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'found_items' AND column_name = 'distinctive_file_name') THEN
    ALTER TABLE found_items RENAME COLUMN distinctive_image_file_name TO distinctive_file_name;
  END IF;
END $$;
